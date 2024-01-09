const express = require('express');
const multer = require('multer');
const jimp = require('jimp');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json());
const corsOptions = {
  origin: ["*"],
  credentials: true,
};

app.use(cors(corsOptions));

// Set up multer to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Function to enhance image for better text visibility
const enhanceImage = async (inputPath, outputPath) => {
  try {
    const image = await jimp.read(inputPath);

    // Resize the image with "contain" option
    image.resize(1600, 1200, jimp.RESIZE_CONTAIN);

    // Adjust brightness
    image.brightness(0.2);

    // Apply a contrast stretch
    image.contrast(0.6);

    
    image.posterize(2);

    // image.threshold({ max: 250 });
    // Normalize the image
    image.normalize();

    // Enhance text visibility by adjusting saturation and lightness
    image.color([
      { apply: 'saturate', params: [60] },
      { apply: 'lighten', params: [10] }
    ]);

    // Simulate sharpening using convolution matrix
    const sharpenMatrix = [
      [-1, -1, -1],
      [-1, 9, -1],
      [-1, -1, -1],
    ];
    image.convolute(sharpenMatrix);

    // Save the enhanced image
    await image.writeAsync(outputPath);

    console.log('Image enhancement successful');
  } catch (error) {
    console.error('Error enhancing image:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

// API endpoint for handling image uploads and enhancement
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Input and output paths for the image
    const inputImagePath = req.file.path;
    const outputImagePath = path.join(__dirname, 'uploads', 'enhanced-image.jpg');

    // Enhance the image
    await enhanceImage(inputImagePath, outputImagePath);

    // Delete the uploaded image to manage the 'uploads' folder
    await fs.unlink(inputImagePath);

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
