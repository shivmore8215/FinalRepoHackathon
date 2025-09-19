import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createSuperUser = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🔍 Checking for existing super admin...');
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      role: 'super_admin',
      username: process.env.SUPER_ADMIN_USERNAME || 'super_admin'
    });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin already exists:');
      console.log(`   Username: ${existingSuperAdmin.username}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Full Name: ${existingSuperAdmin.fullName}`);
      console.log(`   Created: ${existingSuperAdmin.createdAt}`);
      console.log(`   Status: ${existingSuperAdmin.status}`);
      process.exit(0);
    }
    
    console.log('🚀 Creating super admin user...');
    
    // Create super admin user
    const superAdminData = {
      username: process.env.SUPER_ADMIN_USERNAME || 'super_admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@trainplanwise.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'super_admin',
      fullName: 'Super Administrator'
    };
    
    const superAdmin = await User.createSuperAdmin(superAdminData);
    
    console.log('✅ Super admin created successfully!');
    console.log('📋 Super Admin Details:');
    console.log(`   ID: ${superAdmin._id}`);
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Full Name: ${superAdmin.fullName}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Status: ${superAdmin.status}`);
    console.log(`   Created: ${superAdmin.createdAt}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'super_admin'}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Start the backend server: npm start');
    console.log('2. Access the admin portal in your frontend');
    console.log('3. Use the credentials above to log in as super admin');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 This error usually means a user with this username or email already exists.');
      console.log('   Try checking the database or use different credentials.');
    }
    
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
};

// Run the script
createSuperUser();