// filepath: /home/kiezu/Documents/Univ/Semester6/Automasi-Layanan/login-web/login-page-app/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'src')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});