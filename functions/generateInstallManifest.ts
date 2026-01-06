import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const url = new URL(req.url);
        const buildId = url.searchParams.get('build_id');

        if (!buildId) {
            return Response.json({ error: 'Missing build_id' }, { status: 400 });
        }

        // Fetch build
        const builds = await base44.entities.Build.filter({ id: buildId });
        const build = builds[0];

        if (!build) {
            return Response.json({ error: 'Build not found' }, { status: 404 });
        }

        if (!build.ipa_url) {
            return Response.json({ error: 'IPA not available' }, { status: 404 });
        }

        // Generate iOS OTA installation manifest
        const manifest = {
            items: [
                {
                    assets: [
                        {
                            kind: 'software-package',
                            url: build.ipa_url
                        }
                    ],
                    metadata: {
                        'bundle-identifier': build.bundle_id,
                        'bundle-version': build.version,
                        'kind': 'software',
                        'title': build.project_name || 'App'
                    }
                }
            ]
        };

        // Return as plist XML
        const plistXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>${build.ipa_url}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>${build.bundle_id}</string>
                <key>bundle-version</key>
                <string>${build.version}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>${build.project_name || 'App'}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;

        return new Response(plistXml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Content-Disposition': `attachment; filename="${build.project_name || 'app'}-manifest.plist"`
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});