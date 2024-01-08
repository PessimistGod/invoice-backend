const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const port = 5000;


app.use(express.json());


const corsOptions = {
    origin: ["*"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));

// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Image enhancement function
const enhanceImage = async (inputPath, outputPath) => {
    const imageBuffer = await fs.readFile(inputPath);
  
    // Perform enhancement operations using sharp
    const enhancedImageBuffer = await sharp(imageBuffer)
      .resize(2400, 1800, { fit: "contain" }) // Increase dimensions for better quality
      .gamma(3.0) // Adjust gamma correction
      .modulate({ brightness: 1.8, saturation: 4.0, contrast: 15.5 })
      .sharpen({ sigma: 10, flat: 2, jagged: 0.2 })
      .normalize()
      .toBuffer();
  
    // Save the enhanced image
    await fs.writeFile(outputPath, enhancedImageBuffer);
  
    console.log('Image enhancement successful');
  };
  
  
  

// API endpoint for handling image uploads and enhancement
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Input and output paths for the image
    const inputImagePath = req.file.path;
    const outputImagePath = path.join(__dirname, 'uploads', 'enhanced-image.jpg');
    // const outputImagePath = path.join('uploads', 'enhanced-image.jpg');

    // Enhance the image
    await enhanceImage(inputImagePath, outputImagePath);

    // Send the enhanced image back to the frontend
    res.sendFile(outputImagePath);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Serve the uploads folder statically (for testing purposes)
app.use('/uploads', express.static('uploads'));

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
