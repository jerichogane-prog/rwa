# WP thumbnail fallback — `functions.php` patch

## Problem

`/wp-json/rwa/v1/listings` returns `thumbnail: null` for listings that have
RTCL gallery images but no native WordPress featured image. RTCL's "Post a
listing" flow uploads to the gallery, not to `_thumbnail_id`, so most
user-submitted listings come back imageless on the Next.js front end.

## Fix

Drop this in the active theme's `functions.php`. It hooks
`rest_request_after_callbacks`, which runs after any REST callback — including
the custom `rwa/v1` plugin — and patches missing thumbnails on the way out.
No plugin edit needed.

## Snippet

```php
/**
 * RWA: backfill listing thumbnails from RTCL gallery / attached children
 * when the rwa/v1 plugin returns thumbnail: null.
 *
 * Runs only on /wp-json/rwa/v1/listings* responses. Cheap loop; only mutates
 * items whose thumbnail is currently empty.
 */
add_filter( 'rest_request_after_callbacks', function ( $response, $handler, $request ) {
    if ( ! ( $response instanceof WP_REST_Response ) ) {
        return $response;
    }

    $route = (string) $request->get_route();
    if ( strpos( $route, '/rwa/v1/listings' ) !== 0 ) {
        return $response;
    }

    $data    = $response->get_data();
    $is_list = is_array( $data ) && isset( $data[0] );
    $items   = $is_list ? $data : array( $data );

    foreach ( $items as $i => $item ) {
        if ( ! is_array( $item ) ) {
            continue;
        }

        $has_thumb = ! empty( $item['thumbnail'] );
        if ( $has_thumb ) {
            continue;
        }

        $post_id = isset( $item['id'] ) ? (int) $item['id'] : 0;
        if ( ! $post_id ) {
            continue;
        }

        $attachment_id = rwa_resolve_listing_image_id( $post_id );
        if ( ! $attachment_id ) {
            continue;
        }

        $url    = wp_get_attachment_image_url( $attachment_id, 'large' );
        $srcset = wp_get_attachment_image_srcset( $attachment_id, 'large' );

        $items[ $i ]['thumbnail']        = $url ?: null;
        $items[ $i ]['thumbnail_srcset'] = $srcset ?: null;
    }

    $response->set_data( $is_list ? $items : $items[0] );

    return $response;
}, 10, 3 );

/**
 * Resolve a listing's first available image attachment ID.
 * Order: RTCL gallery → first attached child → 0.
 */
function rwa_resolve_listing_image_id( $post_id ) {
    // 1. RTCL helper if exposed by the plugin.
    if ( function_exists( 'rtcl_get_gallery_image_ids' ) ) {
        $ids = rtcl_get_gallery_image_ids( $post_id );
        if ( is_array( $ids ) && ! empty( $ids ) ) {
            return (int) $ids[0];
        }
    }

    // 2. Common RTCL meta keys (varies by version).
    foreach ( array( '_rtcl_images', 'rtcl_listing_gallery_image_ids' ) as $meta_key ) {
        $raw = get_post_meta( $post_id, $meta_key, true );

        if ( is_array( $raw ) && ! empty( $raw ) ) {
            return (int) $raw[0];
        }

        if ( is_string( $raw ) && $raw !== '' ) {
            $ids = array_filter( array_map( 'absint', explode( ',', $raw ) ) );
            if ( ! empty( $ids ) ) {
                return (int) reset( $ids );
            }
        }
    }

    // 3. First attachment child of the listing.
    $children = get_children( array(
        'post_parent'    => $post_id,
        'post_type'      => 'attachment',
        'post_mime_type' => 'image',
        'orderby'        => 'menu_order ID',
        'order'          => 'ASC',
        'numberposts'    => 1,
        'fields'         => 'ids',
    ) );

    if ( ! empty( $children ) ) {
        return (int) reset( $children );
    }

    return 0;
}
```

## Where to paste

Active theme: `wp-content/themes/<your-theme>/functions.php`. If the site uses
a child theme, paste into the child theme's `functions.php` so a parent-theme
update doesn't wipe it.

## Verify

```bash
curl -s "https://cms.rubywantads.com/wp-json/rwa/v1/listings?per_page=10" \
  | jq -r '.[] | "\(.id)  \(.thumbnail // "<NONE>")  \(.title)"'
```

Listing **156511** ("Kitchen Appliances") should flip from `null` to a real
`wp-content/uploads/...` URL. Listings that truly have no image (e.g. 156510
"Jeep Wagoneer") stay `null` — the Next.js `ListingCard` already renders its
"No image" placeholder for those.

## Cache invalidation

If a page cache, object cache, or CDN sits in front of REST responses, flush
after deploy so the old `thumbnail: null` payloads get replaced.

## Why this works (and why it's safe)

- `rest_request_after_callbacks` is a core WP filter that runs after any REST
  callback returns. We restrict it to routes starting with `/rwa/v1/listings`,
  so other endpoints are untouched.
- We only mutate items whose `thumbnail` is already empty — never overwrite
  an image the plugin already resolved.
- All filesystem / DB access is via WP core helpers (`wp_get_attachment_*`,
  `get_post_meta`, `get_children`), so it respects multisite, CDN URLs, and
  any image-resize plugin behavior already configured.
