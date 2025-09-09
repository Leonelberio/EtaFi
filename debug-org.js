const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function debugOrg() {
  try {
    // Get all users with their current organization
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        currentOrganizationId: true,
        organizations: {
          select: {
            organizationId: true,
            role: true,
            isActive: true,
            organization: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    console.log('=== USERS AND THEIR ORGANIZATIONS ===');
    users.forEach(user => {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`Current Org ID: ${user.currentOrganizationId}`);
      console.log('Memberships:');
      user.organizations.forEach(membership => {
        console.log(`  - ${membership.organization.name} (${membership.organizationId}) - Role: ${membership.role} - Active: ${membership.isActive}`);
      });
    });

    // Get all organizations
    const orgs = await db.organization.findMany({
      select: {
        id: true,
        name: true,
        members: {
          select: {
            userId: true,
            role: true,
            isActive: true,
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    console.log('\n=== ORGANIZATIONS ===');
    orgs.forEach(org => {
      console.log(`\nOrg: ${org.name} (${org.id})`);
      console.log('Members:');
      org.members.forEach(member => {
        console.log(`  - ${member.user.name} (${member.userId}) - Role: ${member.role} - Active: ${member.isActive}`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

debugOrg();
