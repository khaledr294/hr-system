/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

async function getVercelIds(token) {
    console.log('🔍 Fetching Vercel projects and teams...');
    
    try {
        // Get user info and teams
        const userInfo = await makeRequest('https://api.vercel.com/v2/user', token);
        console.log(`👤 User: ${userInfo.name || userInfo.email}`);
        
        // Get teams
        const teamsResponse = await makeRequest('https://api.vercel.com/v2/teams', token);
        const teams = teamsResponse.teams || [];
        
        console.log('\n📋 Available Teams/Organizations:');
        teams.forEach((team, index) => {
            console.log(`${index + 1}. ${team.name} (ID: ${team.id})`);
        });
        
        // Get projects
        const projectsResponse = await makeRequest('https://api.vercel.com/v9/projects', token);
        const projects = projectsResponse.projects || [];
        
        console.log('\n📦 Available Projects:');
        projects.forEach((project, index) => {
            console.log(`${index + 1}. ${project.name} (ID: ${project.id})`);
            if (project.name.includes('hr') || project.name.includes('system')) {
                console.log(`   ⭐ This looks like your HR system project!`);
                console.log(`   📄 PROJECT_ID: ${project.id}`);
                if (project.accountId) {
                    console.log(`   🏢 ORG_ID: ${project.accountId}`);
                }
            }
        });
        
        // If no teams, use personal account
        if (teams.length === 0) {
            console.log(`\n🏠 Using personal account as ORG_ID: ${userInfo.id}`);
        }
        
        return { userInfo, teams, projects };
        
    } catch (error) {
        console.error('❌ Error fetching Vercel data:', error.message);
        return null;
    }
}

function makeRequest(url, token) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
                    } else {
                        resolve(parsed);
                    }
                } catch {
                    reject(new Error('Invalid JSON response'));
                }
            });
        }).on('error', reject);
    });
}

// Run if called directly
if (require.main === module) {
    const token = process.argv[2];
    if (!token) {
        console.log('Usage: node get-ids.js <vercel-token>');
        process.exit(1);
    }
    
    getVercelIds(token);
}

module.exports = { getVercelIds };