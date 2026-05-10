const fs = require('fs');
const path = require('path');

const directoryPath = '/home/men3emk1/Documents/academic-portal/academic-portal/frontend/src';

const replacements = [
  { match: /Doctor <br \/>/g, replace: 'Instructor <br />' },
  { match: /Welcome, Doctor!/g, replace: 'Welcome, Instructor!' },
  { match: /label:\s*'Doctors'/g, replace: "label: 'Instructors'" },
  { match: /label:\s*'Doctor'/g, replace: "label: 'Instructor'" },
  { match: /Doctor Management/g, replace: 'Instructor Management' },
  { match: /Add Doctor/g, replace: 'Add Instructor' },
  { match: /Add New Doctor/g, replace: 'Add New Instructor' },
  { match: /Edit Doctor/g, replace: 'Edit Instructor' },
  { match: /Create Doctor/g, replace: 'Create Instructor' },
  { match: /Manage Doctors/g, replace: 'Manage Instructors' },
  { match: /Dr\. /g, replace: 'Inst. ' },
  { match: /Doctor added successfully/g, replace: 'Instructor added successfully' },
  { match: /Doctor updated successfully/g, replace: 'Instructor updated successfully' },
  { match: /Doctor deleted/g, replace: 'Instructor deleted' },
  { match: /All Doctors/g, replace: 'All Instructors' },
  { match: /Specific Doctor/g, replace: 'Specific Instructor' },
  { match: /Doctor ID/g, replace: 'Instructor ID' },
  { match: /Welcome back, Dr\./g, replace: 'Welcome back, Inst.' },
  { match: /Doctor:/g, replace: 'Instructor:' },
  { match: />Doctor</g, replace: ">Instructor<" },
  { match: />Doctors</g, replace: ">Instructors<" },
  { match: /Doctor\s*<\/th>/gi, replace: 'Instructor</th>' },
  { match: />Dr\.</g, replace: '>Inst.<' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const r of replacements) {
        if (content.match(r.match)) {
          content = content.replace(r.match, r.replace);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDirectory(directoryPath);
