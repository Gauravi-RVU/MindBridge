const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Resource = require('./models/Resource');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await User.deleteMany({});
    await Resource.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin
    await User.create({ name: 'Admin User', email: 'admin@demo.com', password: 'demo1234', role: 'admin', college: 'MindBridge University', department: 'IQAC' });
    console.log('✅ Admin created: admin@demo.com / demo1234');

    // Create counsellor
    await User.create({ name: 'Dr. Priya Sharma', email: 'counsellor@demo.com', password: 'demo1234', role: 'counsellor', college: 'MindBridge University', department: 'Psychology' });
    console.log('✅ Counsellor created: counsellor@demo.com / demo1234');

    // Create student
    await User.create({ name: 'Arjun Mehta', email: 'student@demo.com', password: 'demo1234', role: 'student', college: 'MindBridge University', department: 'Computer Science', year: '3rd Year' });
    console.log('✅ Student created: student@demo.com / demo1234');

    // Create resources
    const resources = [
      { title: '4-7-8 Breathing Exercise', description: 'A powerful technique to calm anxiety instantly. Breathe in for 4 counts, hold for 7, exhale for 8 counts.', type: 'exercise', category: 'anxiety', language: 'en', duration: '5 min', isFeatured: true },
      { title: 'Understanding Depression in Students', description: 'A comprehensive guide on recognizing depression signs and seeking help in academic environments.', type: 'article', category: 'depression', language: 'en', duration: '10 min read', isFeatured: true },
      { title: 'Progressive Muscle Relaxation', description: 'Guided audio to systematically relax each muscle group and release physical tension.', type: 'audio', category: 'stress', language: 'en', duration: '15 min', isFeatured: false },
      { title: 'Sleep Hygiene for Students', description: 'Practical tips to improve sleep quality when deadlines and exams disrupt your schedule.', type: 'guide', category: 'sleep', language: 'en', duration: '8 min read', isFeatured: false },
      { title: 'Mindfulness Meditation for Beginners', description: 'A 10-minute guided video meditation designed for students who have never tried mindfulness before.', type: 'video', category: 'mindfulness', language: 'en', duration: '10 min', isFeatured: true },
      { title: 'परीक्षा की चिंता को कैसे प्रबंधित करें', description: 'परीक्षा के दौरान चिंता और तनाव से निपटने के लिए व्यावहारिक सुझाव।', type: 'guide', category: 'anxiety', language: 'hi', duration: '7 min', isFeatured: false },
      { title: 'Academic Burnout — Signs and Recovery', description: 'Identify the warning signs of burnout early and learn evidence-based recovery strategies.', type: 'article', category: 'academic', language: 'en', duration: '12 min read', isFeatured: false },
      { title: 'Building Social Connections in College', description: 'Practical strategies for overcoming loneliness and building meaningful relationships on campus.', type: 'guide', category: 'relationships', language: 'en', duration: '6 min read', isFeatured: false },
    ];
    await Resource.insertMany(resources);
    console.log('✅ Resources seeded');

    console.log('\n🎉 Seed complete! You can now log in with:');
    console.log('   Student:    student@demo.com / demo1234');
    console.log('   Counsellor: counsellor@demo.com / demo1234');
    console.log('   Admin:      admin@demo.com / demo1234\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
