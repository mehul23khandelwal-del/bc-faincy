const sharp = require('sharp');

sharp('public/logo.jpg').resize(32, 32).toFile('public/favicon-32.png');
sharp('public/logo.jpg').resize(16, 16).toFile('public/favicon-16.png');
sharp('public/logo.jpg').resize(180, 180).toFile('public/apple-touch-icon.png');
