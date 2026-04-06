// Run this with: node src/lib/db-init.js
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
  console.log('🔧 Initializing database...');

  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Users table created');

  // Create products table
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      brand VARCHAR(100),
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      stock INTEGER DEFAULT 0,
      image_url TEXT,
      category VARCHAR(50),
      size_ml INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Products table created');

  // Create transactions table
  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(30) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ Transactions table created');

  // Create transaction_items table
  await sql`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER REFERENCES transactions(id),
      product_id INTEGER REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price_at_purchase DECIMAL(10,2) NOT NULL
    )
  `;
  console.log('✅ Transaction items table created');

  // Create admin account
  const adminExists = await sql`SELECT * FROM users WHERE email = 'admin@scentlux.com'`;
  if (adminExists.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@scentlux.com', ${hashedPassword}, 'admin')
    `;
    console.log('✅ Admin account created: admin@scentlux.com / admin123');
  } else {
    console.log('ℹ️  Admin account already exists');
  }

  // Seed sample products
  const productsExist = await sql`SELECT COUNT(*) as count FROM products`;
  if (parseInt(productsExist[0].count) === 0) {
    await sql`
      INSERT INTO products (name, brand, description, price, stock, image_url, category, size_ml) VALUES
      ('Midnight Oud', 'Maison Noir', 'A deep, smoky oud with notes of dark amber, sandalwood, and a touch of leather. Mysterious and captivating.', 1850000, 25, 'https://www.moradi.pk/cdn/shop/files/Perfume-Midnight-Oud-50ml.jpg?v=1753263168', 'Oriental', 50),
      ('Rose Absolue', 'Lumière Paris', 'The finest Bulgarian rose absolute, kissed with bergamot and white musk. Timeless femininity in every drop.', 1450000, 30, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500', 'Floral', 100),
      ('Acqua Marina', 'Azzuro', 'Crisp sea breeze, driftwood, and vetiver. A modern aquatic that evokes the Mediterranean coast.', 980000, 40, 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=500', 'Fresh', 75),
      ('Bois Doré', 'Atelier Forêt', 'Golden woods — cedarwood, golden amber, vanilla, and a whisper of saffron. Warm and enveloping.', 1650000, 20, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500', 'Woody', 50),
      ('Citrus Bloom', 'Soleil & Co', 'A vibrant burst of Sicilian lemon, neroli blossom, and green tea. Effortlessly uplifting.', 750000, 50, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500', 'Fresh', 100),
      ('JPG Le Male', 'Nomade', 'Silky Australian sandalwood layered with iris, creamy musk, and a hint of cardamom. Skin-close and intimate.', 2100000, 15, 'https://cf.shopee.co.id/file/d00769b4d22369f628bb2ed751a4c869', 'Woody', 50),
      ('Jasmin Nocturne', 'Nuit Blanche', 'Night-blooming jasmine, tuberose, and dark patchouli. A heady, intoxicating floral for after dark.', 1350000, 35, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500', 'Floral', 75),
      ('YSL Y EDP, 'Glacé', 'Clean, powdery musk with hints of white cedar and soft cotton. Pure and skin-like.', 890000, 45, 'https://www.yslbeauty.co.id/dw/image/v2/BFZM_PRD/on/demandware.static/-/Sites-ysl-master-catalog/default/dwc3899dbf/square/Fragrance/Y_EDP/3614272050334_40ml_y-eau-de-parfum_Alt1.jpg?sw=678&sh=678&sm=cut&sfrm=png&q=85', 'Musk', 100)
    `;
    console.log('✅ Sample products seeded');
  } else {
    console.log('ℹ️  Products already seeded');
  }

  console.log('\n🎉 Database initialized successfully!');
  console.log('Admin credentials: admin@scentlux.com / admin123');
  process.exit(0);
}

initDB().catch((err) => {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
});
