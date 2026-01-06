import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { build_id, stage_name, stage_status, error } = await req.json();

        if (!build_id || !stage_name || !stage_status) {
            return Response.json({ 
                error: 'Missing required fields: build_id, stage_name, stage_status' 
            }, { status: 400 });
        }

        // Fetch current build
        const builds = await base44.entities.Build.filter({ id: build_id });
        const build = builds[0];

        if (!build) {
            return Response.json({ error: 'Build not found' }, { status: 404 });
        }

        // Initialize stages if not present
        let stages = build.stages || [
            { name: 'queued', label: 'Queued', status: 'pending' },
            { name: 'checkout', label: 'Source Checkout', status: 'pending' },
            { name: 'dependencies', label: 'Resolve Dependencies', status: 'pending' },
            { name: 'archive', label: 'Archive', status: 'pending' },
            { name: 'codesign', label: 'Code Sign', status: 'pending' },
            { name: 'export', label: 'Export IPA', status: 'pending' }
        ];

        // Update the specific stage
        const stageIndex = stages.findIndex(s => s.name === stage_name);
        if (stageIndex !== -1) {
            stages[stageIndex].status = stage_status;
            
            if (stage_status === 'running' && !stages[stageIndex].started_at) {
                stages[stageIndex].started_at = new Date().toISOString();
            }
            
            if (['completed', 'failed'].includes(stage_status)) {
                stages[stageIndex].completed_at = new Date().toISOString();
            }
        }

        // Determine overall build status
        let buildStatus = build.status;
        if (stage_status === 'failed') {
            buildStatus = 'failed';
        } else if (stage_status === 'running') {
            buildStatus = 'running';
        } else if (stages.every(s => s.status === 'completed')) {
            buildStatus = 'success';
        }

        // Update build
        const updatedBuild = await base44.entities.Build.update(build_id, {
            stages,
            current_stage: stage_name,
            status: buildStatus,
            error_summary: stage_status === 'failed' ? error : build.error_summary
        });

        return Response.json({
            success: true,
            build: updatedBuild
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});