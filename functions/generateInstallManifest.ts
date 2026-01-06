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
        // Use production domain for IPA hosting
        const ipaUrl = `https://install.fredsnwdocprep.org/ios/AutoInsightIO-${build.version}.ipa`;
        
        const manifest = {
            items: [
                {
                    assets: [
                        {
                            kind: 'software-package',
                            url: ipaUrl
                        }
                    ],
                    metadata: {
                        'bundle-identifier': 'com.fred.autoinsight',
                        'bundle-version': build.version || '1.11.0',
                        'kind': 'software',
                        'title': 'AutoInsight IO'
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
                    <string>${ipaUrl}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>com.fred.autoinsight</string>
                <key>bundle-version</key>
                <string>${build.version || '1.11.0'}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>AutoInsight IO</string>
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