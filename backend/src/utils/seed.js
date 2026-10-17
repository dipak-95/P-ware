require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const Product = require('../models/Product');
const User = require('../models/User');

const seedData = async () => {
  try {
    await connectDB();

    // Clear old data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Categories and Products cleared.');

    // 1. Create Categories
    const washBasin = await Category.create({ name: 'Wash Basin', parentCategoryId: null });
    const sanitaryWare = await Category.create({ name: 'Sanitary Ware', parentCategoryId: null });
    const accessories = await Category.create({ name: 'Accessories', parentCategoryId: null });

    // 2. Create Subcategories
    const wallMounted = await Category.create({ name: 'Wall Mounted', parentCategoryId: washBasin._id });
    const tableTop = await Category.create({ name: 'Table Top', parentCategoryId: washBasin._id });
    const counterTop = await Category.create({ name: 'Counter Top', parentCategoryId: washBasin._id });

    const westernToilet = await Category.create({ name: 'Western Toilet', parentCategoryId: sanitaryWare._id });
    const onePiece = await Category.create({ name: 'One Piece', parentCategoryId: sanitaryWare._id });
    const twoPiece = await Category.create({ name: 'Two Piece', parentCategoryId: sanitaryWare._id });

    console.log('Categories and Subcategories seeded successfully.');

    // 3. Create Products
    const productsData = [
      {
        name: 'Prism Wall Hung Basin',
        code: 'WB-PR-01',
        images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/prism_series.pdf',
        specifications: {
          'Dimensions': '450 x 350 x 120 mm',
          'Material': 'Vitreous China (Ceramic)',
          'Finish': 'Glossy White',
          'Mounting Type': 'Wall Mounted',
          'Overflow': 'Integrated Overflow',
        },
        categoryId: washBasin._id,
        subCategoryId: wallMounted._id,
      },
      {
        name: 'Vogue Table Top Ceramic Basin',
        code: 'WB-VG-02',
        images: ['https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/vogue_series.pdf',
        specifications: {
          'Dimensions': '500 x 400 x 140 mm',
          'Material': 'Fine Ceramic',
          'Finish': 'Matte Black & Gold Accent',
          'Mounting Type': 'Table Top',
          'Bowl Depth': '110 mm',
        },
        categoryId: washBasin._id,
        subCategoryId: tableTop._id,
      },
      {
        name: 'Elixir Counter Top Basin',
        code: 'WB-EL-03',
        images: ['https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/elixir_series.pdf',
        specifications: {
          'Dimensions': '600 x 450 x 130 mm',
          'Material': 'Quartz Stone Composite',
          'Finish': 'Matte White',
          'Mounting Type': 'Counter Top',
          'Tap Hole': 'Single Tap Hole',
        },
        categoryId: washBasin._id,
        subCategoryId: counterTop._id,
      },
      {
        name: 'Royal One Piece Closet',
        code: 'SW-OP-101',
        images: ['https://images.unsplash.com/photo-1564540574859-0dfb63985953?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/royal_toilets.pdf',
        specifications: {
          'Dimensions': '720 x 380 x 680 mm',
          'Material': 'Ceramic',
          'Flushing System': 'Siphonic Dual Flush (3/6 Liters)',
          'Seat Cover': 'Soft Close UF Seat Cover',
          'Trap Type': 'S-Trap',
          'Trap Distance': '300 mm (12 inches)',
        },
        categoryId: sanitaryWare._id,
        subCategoryId: onePiece._id,
      },
      {
        name: 'Alpha Wall Hung Western Toilet',
        code: 'SW-WT-201',
        images: ['https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/alpha_series.pdf',
        specifications: {
          'Dimensions': '530 x 365 x 350 mm',
          'Material': 'Ceramic',
          'Flushing System': 'Rimless Washdown Flush',
          'Seat Cover': 'Slim Soft Close UF Cover',
          'Trap Type': 'P-Trap',
        },
        categoryId: sanitaryWare._id,
        subCategoryId: westernToilet._id,
      },
      {
        name: 'Duo Two Piece Closet',
        code: 'SW-TP-301',
        images: ['https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/duo_series.pdf',
        specifications: {
          'Dimensions': '680 x 370 x 790 mm',
          'Material': 'Ceramic',
          'Flushing System': 'Washdown Dual Flush',
          'Seat Cover': 'PP Soft Close Cover',
          'Trap Type': 'S-Trap',
          'Trap Distance': '220 mm',
        },
        categoryId: sanitaryWare._id,
        subCategoryId: twoPiece._id,
      },
      {
        name: 'Premium Brass Basin Mixer Tap',
        code: 'AC-BM-501',
        images: ['https://images.unsplash.com/photo-1585137537338-76ad1ad0217a?auto=format&fit=crop&q=80&w=600'],
        catalogPdf: '/catalogs/premium_faucets.pdf',
        specifications: {
          'Material': 'Lead-free Brass Body',
          'Cartridge': 'Ceramic Disc Cartridge (Tested for 500k cycles)',
          'Finish': 'PVD Chrome Finish',
          'Flow Rate': '8 Liters/min at 3 bar',
          'Inclusions': '2x 450mm Connection Braided Hoses',
        },
        categoryId: accessories._id,
        subCategoryId: null,
      },
    ];

    await Product.insertMany(productsData);
    console.log('Products seeded successfully.');

    // 4. Create default admin if not existing (for testing and access)
    const adminEmail = 'admin@pware.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        email: adminEmail,
        role: 'admin',
        status: 'approved',
        onboardingComplete: true,
      });
      console.log('Default Admin created: admin@pware.com');
    }

    // 5. Create default Trader for testing
    const TraderProfile = require('../models/TraderProfile');
    const traderEmail = 'trader100@pware.com';
    let traderUser = await User.findOne({ email: traderEmail });
    if (!traderUser) {
      traderUser = await User.create({
        email: traderEmail,
        role: 'trader',
        status: 'approved',
        onboardingComplete: true,
      });
    } else {
      // Ensure approved
      traderUser.role = 'trader';
      traderUser.status = 'approved';
      traderUser.onboardingComplete = true;
      await traderUser.save();
    }
    const existingTP = await TraderProfile.findOne({ userId: traderUser._id });
    if (!existingTP) {
      await TraderProfile.create({
        userId: traderUser._id,
        companyName: 'Rajesh Sanitary Distributors',
        gstNumber: '24AAAAP1234A1Z1',
        ownerName: 'Rajesh Patel',
        address: { street: 'GIDC Industrial Area', city: 'Morbi', state: 'Gujarat', pincode: '363641' },
        traderCode: 'TRD-1001',
        referralLink: `http://localhost:3000/register?ref=TRD-1001`,
      });
      console.log('Default Trader created: trader100@pware.com (TRD-1001)');
    }

    // 6. Create default Retailer for testing (mapped to above Trader)
    const RetailerProfile = require('../models/RetailerProfile');
    const retailerEmail = 'retailer50@pware.com';
    let retailerUser = await User.findOne({ email: retailerEmail });
    if (!retailerUser) {
      retailerUser = await User.create({
        email: retailerEmail,
        role: 'retailer',
        status: 'approved',
        onboardingComplete: true,
      });
    } else {
      retailerUser.role = 'retailer';
      retailerUser.status = 'approved';
      retailerUser.onboardingComplete = true;
      await retailerUser.save();
    }
    const existingRP = await RetailerProfile.findOne({ userId: retailerUser._id });
    if (!existingRP) {
      await RetailerProfile.create({
        userId: retailerUser._id,
        companyName: 'Sagar Ceramic Gallery',
        ownerName: 'Sagar Patel',
        address: { street: 'Ram Chowk', city: 'Morbi', state: 'Gujarat', pincode: '363641' },
        mappedTraderId: traderUser._id,
      });
      console.log('Default Retailer created: retailer50@pware.com (mapped to TRD-1001)');
    }

    console.log('All seeding tasks completed.');
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedData();
