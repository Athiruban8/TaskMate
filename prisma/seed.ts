import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data - order matters due to foreign keys
  await prisma.projectMember.deleteMany()
  await prisma.projectTech.deleteMany()
  await prisma.projectCategory.deleteMany()
  await prisma.projectIndustry.deleteMany()
  await prisma.project.deleteMany()
  await prisma.technology.deleteMany()
  await prisma.category.deleteMany()
  await prisma.industry.deleteMany()
  await prisma.user.deleteMany()

  // Create technologies
  const technologies = await Promise.all([
    prisma.technology.create({ data: { name: 'React', slug: 'react', color: '#61DAFB' } }),
    prisma.technology.create({ data: { name: 'Node.js', slug: 'nodejs', color: '#339933' } }),
    prisma.technology.create({ data: { name: 'Python', slug: 'python', color: '#3776AB' } }),
    prisma.technology.create({ data: { name: 'TypeScript', slug: 'typescript', color: '#3178C6' } }),
    prisma.technology.create({ data: { name: 'PostgreSQL', slug: 'postgresql', color: '#336791' } }),
    prisma.technology.create({ data: { name: 'MongoDB', slug: 'mongodb', color: '#47A248' } }),
    prisma.technology.create({ data: { name: 'React Native', slug: 'react-native', color: '#61DAFB' } }),
    prisma.technology.create({ data: { name: 'TensorFlow', slug: 'tensorflow', color: '#FF6F00' } }),
    prisma.technology.create({ data: { name: 'Express', slug: 'express', color: '#000000' } }),
    prisma.technology.create({ data: { name: 'Firebase', slug: 'firebase', color: '#FFCA28' } }),
  ])

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Full-Stack', slug: 'full-stack' } }),
    prisma.category.create({ data: { name: 'AI/ML', slug: 'ai-ml' } }),
    prisma.category.create({ data: { name: 'Mobile', slug: 'mobile' } }),
    prisma.category.create({ data: { name: 'DevOps', slug: 'devops' } }),
    prisma.category.create({ data: { name: 'UI/UX', slug: 'ui-ux' } }),
    prisma.category.create({ data: { name: 'Open Source', slug: 'open-source' } }),
  ])

  // Create industries
  const industries = await Promise.all([
    prisma.industry.create({ data: { name: 'Healthcare', slug: 'healthcare' } }),
    prisma.industry.create({ data: { name: 'Finance', slug: 'finance' } }),
    prisma.industry.create({ data: { name: 'Education', slug: 'education' } }),
    prisma.industry.create({ data: { name: 'Productivity', slug: 'productivity' } }),
    prisma.industry.create({ data: { name: 'E-commerce', slug: 'ecommerce' } }),
    prisma.industry.create({ data: { name: 'Gaming', slug: 'gaming' } }),
  ])

  // Create users with skills as string arrays
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@university.edu',
        name: 'Alice Chen',
        githubUrl: 'https://github.com/alicechen',
        city: 'Bangalore',
        skills: ['React', 'Python', 'Machine Learning', 'Data Science']
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@university.edu', 
        name: 'Bob Kumar',
        githubUrl: 'https://github.com/bobkumar',
        city: 'Delhi',
        skills: ['Node.js', 'PostgreSQL', 'DevOps', 'Express.js']
      }
    }),
    prisma.user.create({
      data: {
        email: 'carol@university.edu',
        name: 'Carol Singh',
        city: 'Mumbai',
        skills: ['UI/UX', 'Figma', 'Frontend', 'React Native']
      }
    }),
    prisma.user.create({
      data: {
        email: 'david@university.edu',
        name: 'David Patel',
        city: 'Pune',
        skills: ['JavaScript', 'TypeScript', 'Full-Stack', 'MongoDB']
      }
    })
  ])

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        title: 'AI-Powered Recipe Recommender',
        description: 'Building a machine learning model that suggests recipes based on available ingredients and dietary preferences. Need help with data preprocessing and model training.',
        city: 'Bangalore',
        teamSize: 5,
        ownerId: users[0].id
      }
    }),
    prisma.project.create({
      data: {
        title: 'Campus Event Management System',
        description: 'Developing a full-stack web app for universities to manage events, RSVPs, and notifications. Looking for backend developers familiar with Node.js.',
        city: 'Delhi', 
        teamSize: 4,
        ownerId: users[1].id
      }
    }),
    prisma.project.create({
      data: {
        title: 'Mobile Expense Tracker',
        description: 'Creating a React Native app to help students track their monthly expenses with budget alerts and spending analytics.',
        city: 'Mumbai',
        teamSize: 3,
        ownerId: users[2].id
      }
    }),
    prisma.project.create({
      data: {
        title: 'Open Source Documentation Tool',
        description: 'Contributing to an open-source project that auto-generates API documentation. Need contributors for testing and UI improvements.',
        city: 'Bangalore',
        teamSize: 6,
        ownerId: users[0].id
      }
    }),
    prisma.project.create({
      data: {
        title: 'Blockchain Voting System',
        description: 'Building a secure voting platform using blockchain technology. Looking for smart contract developers and frontend engineers.',
        city: 'Pune',
        teamSize: 4,
        ownerId: users[3].id
      }
    })
  ])

  // Add technologies to projects
  await Promise.all([
    // AI Recipe Recommender: Python, TensorFlow
    prisma.projectTech.create({ data: { projectId: projects[0].id, technologyId: technologies[2].id } }), // Python
    prisma.projectTech.create({ data: { projectId: projects[0].id, technologyId: technologies[7].id } }), // TensorFlow
    
    // Campus Event System: Node.js, TypeScript, PostgreSQL
    prisma.projectTech.create({ data: { projectId: projects[1].id, technologyId: technologies[1].id } }), // Node.js
    prisma.projectTech.create({ data: { projectId: projects[1].id, technologyId: technologies[3].id } }), // TypeScript
    prisma.projectTech.create({ data: { projectId: projects[1].id, technologyId: technologies[4].id } }), // PostgreSQL
    prisma.projectTech.create({ data: { projectId: projects[1].id, technologyId: technologies[8].id } }), // Express
    
    // Mobile Expense Tracker: React Native, Firebase
    prisma.projectTech.create({ data: { projectId: projects[2].id, technologyId: technologies[6].id } }), // React Native
    prisma.projectTech.create({ data: { projectId: projects[2].id, technologyId: technologies[9].id } }), // Firebase
    
    // Documentation Tool: React, TypeScript
    prisma.projectTech.create({ data: { projectId: projects[3].id, technologyId: technologies[0].id } }), // React
    prisma.projectTech.create({ data: { projectId: projects[3].id, technologyId: technologies[3].id } }), // TypeScript
    
    // Blockchain Voting: TypeScript
    prisma.projectTech.create({ data: { projectId: projects[4].id, technologyId: technologies[3].id } }), // TypeScript
  ])

  // Add categories to projects
  await Promise.all([
    // AI Recipe Recommender: AI/ML
    prisma.projectCategory.create({ data: { projectId: projects[0].id, categoryId: categories[1].id } }),
    
    // Campus Event System: Full-Stack
    prisma.projectCategory.create({ data: { projectId: projects[1].id, categoryId: categories[0].id } }),
    
    // Mobile Expense Tracker: Mobile
    prisma.projectCategory.create({ data: { projectId: projects[2].id, categoryId: categories[2].id } }),
    
    // Documentation Tool: Open Source
    prisma.projectCategory.create({ data: { projectId: projects[3].id, categoryId: categories[5].id } }),
    
    // Blockchain Voting: Full-Stack
    prisma.projectCategory.create({ data: { projectId: projects[4].id, categoryId: categories[0].id } }),
  ])

  // Add industries to projects
  await Promise.all([
    // AI Recipe Recommender: Healthcare
    prisma.projectIndustry.create({ data: { projectId: projects[0].id, industryId: industries[0].id } }),
    
    // Campus Event System: Education
    prisma.projectIndustry.create({ data: { projectId: projects[1].id, industryId: industries[2].id } }),
    
    // Mobile Expense Tracker: Productivity
    prisma.projectIndustry.create({ data: { projectId: projects[2].id, industryId: industries[3].id } }),
    
    // Documentation Tool: Productivity
    prisma.projectIndustry.create({ data: { projectId: projects[3].id, industryId: industries[3].id } }),
    
    // Blockchain Voting: Finance
    prisma.projectIndustry.create({ data: { projectId: projects[4].id, industryId: industries[1].id } }),
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`Created:`)
  console.log(`- ${technologies.length} technologies`) 
  console.log(`- ${categories.length} categories`)
  console.log(`- ${industries.length} industries`)
  console.log(`- ${users.length} users`)
  console.log(`- ${projects.length} projects`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
