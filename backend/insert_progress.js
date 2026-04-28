require('dotenv').config();
const CourseProgress = require('./controllers/../models/CourseProgress');

const courseId = 1; // Programming 2, AI department

const syllabus = [
  "1 Lecture 1: Introduction to OOP using C++",
  "1.1 Styles of coding",
  "1.2 What are Classes and Objects?",
  "1.3 OOP design & UML",

  "2 Lecture 2: Principles of OOP",
  "2.1 Encapsulation",
  "2.2 Abstraction",
  "2.3 Inheritance",
  "2.4 Polymorphism",
  "2.5 Benefits of using OOP",

  "3 Lecture 3: Constructors & Destructor",
  "3.1 Access modifiers",
  "3.2 What is a constructor and its types?",
  "3.3 Destructor",
  "3.4 Mutators and Accessors (Setters and getters)",
  "3.5 Inline vs Regular member function",

  "4 Lecture 4: Objects with functions",
  "4.1 Objects as arguments",
  "4.2 Returning objects from function",
  "4.3 Classes, Objects and Memory",
  "4.4 Static Class Data",
  "4.5 Const Member function & Const objects",
  "4.6 Arrays of objects",
  "4.7 Structures and Classes",

  "5 Lecture 5: Dynamic Memory Allocation",
  "5.1 Static & Dynamic Memory",
  "5.2 Creating a Dynamic Array",
  "5.3 Array of objects & Dynamically allocation",

  "6 Lecture 6&7: Inheritance",
  "6.1 What is Inheritance in OOP?",
  "6.2 Inheritance Types",
  "6.3 Class access specification",
  "6.4 Constructors and Destructors in Base and Derived Classes",

  "7 Lecture 8: Polymorphism Part 1",
  "7.1 What is polymorphism?",
  "7.2 Runtime Polymorphism",
  "7.3 Abstract Class",

  "8 Lecture 9&10: Polymorphism Part 2",
  "8.1 Compile time polymorphism",
  "8.2 Function overloading",
  "8.3 Operator overloading",
  "8.4 Class & Function templates",

  "9 Lecture 11: File in/out & Exception Handling",
  "9.1 Introduction",
  "9.2 Opening a file & Reading from it",
  "9.3 Exception Handling"
];

async function run() {
  try {
    // Delete existing progress for this course to avoid duplicates if run multiple times
    await CourseProgress.deleteByCourseId(courseId);
    
    for (let i = 0; i < syllabus.length; i++) {
      const title = syllabus[i];
      await CourseProgress.create(courseId, title, false, i + 1);
      console.log(`Inserted: ${title}`);
    }
    console.log("Successfully inserted syllabus.");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}
run();
