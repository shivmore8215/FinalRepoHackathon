import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data (optional - uncomment if you want to reset)
    // console.log('🧹 Clearing existing users...');
    // await User.deleteMany({});
    
    // Create super admin
    console.log('👑 Creating super admin...');
    const superAdminData = {
      username: process.env.SUPER_ADMIN_USERNAME || 'super_admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@trainplanwise.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'super_admin',
      fullName: 'Super Administrator'
    };
    
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (!existingSuperAdmin) {
      await User.createSuperAdmin(superAdminData);
      console.log('✅ Super admin created');
    } else {
      console.log('ℹ️  Super admin already exists');
    }
    
    // Create some sample users for testing
    console.log('👥 Creating sample users...');
    
    const sampleUsers = [
      {
        username: 'john_doe',
        email: 'john.doe@kmrl.com',
        password: 'password123',
        fullName: 'John Doe',
        status: 'pending'
      },
      {
        username: 'jane_smith',
        email: 'jane.smith@kmrl.com',
        password: 'password123',
        fullName: 'Jane Smith',
        status: 'approved'
      },
      {
        username: 'mike_wilson',
        email: 'mike.wilson@kmrl.com',
        password: 'password123',
        fullName: 'Mike Wilson',
        status: 'pending'
      }
    ];
    
    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.fullName} (${userData.username})`);
      } else {
        console.log(`ℹ️  User already exists: ${userData.username}`);
      }
    }
    
    // Display summary
    console.log('\n📊 Database Summary:');
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const superAdmins = await User.countDocuments({ role: 'super_admin' });
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Super Admins: ${superAdmins}`);
    console.log(`   Approved Users: ${approvedUsers}`);
    console.log(`   Pending Users: ${pendingUsers}`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Run the script
seedDatabase();