const mysql = require('mysql2/promise');

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MySQL...');
    
    // Kết nối MySQL (không chỉ định database)
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '', // Thay đổi nếu có password
    });

    console.log('✅ Connected to MySQL');

    // Drop database nếu tồn tại
    console.log('🗑️  Dropping database travelticket...');
    await connection.execute('DROP DATABASE IF EXISTS travelticket');

    // Tạo database mới
    console.log('🆕 Creating database travelticket...');
    await connection.execute(`
      CREATE DATABASE travelticket 
      CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);

    console.log('✅ Database travelticket created successfully!');

    // Đóng kết nối
    await connection.end();
    
    console.log('🎉 Database reset completed! You can now start the application.');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Suggestions:');
      console.log('1. Check if MySQL is running');
      console.log('2. Verify username/password in the script');
      console.log('3. Make sure you have permission to create databases');
    }
    
    process.exit(1);
  }
}

resetDatabase();
