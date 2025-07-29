// npx node playground.js

console.log("🚀 Starting JavaScript experiment...");

// Basic JavaScript features
const testData = {
  id: 1,
  name: "Test Item",
  isActive: true,
  tags: ["javascript", "experiment"]
};

console.log("Test data:", testData);

// Async/await example
async function fetchMockData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: "Item 1", isActive: true },
        { id: 2, name: "Item 2", isActive: false },
        { id: 3, name: "Item 3", isActive: true }
      ]);
    }, 1000);
  });
}

// Array methods
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = numbers.filter(n => n % 2 === 0);
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);

console.log("Even numbers:", evenNumbers);
console.log("Doubled:", doubled);
console.log("Sum:", sum);

// Modern JavaScript features
const { name: destructuredName, ...rest } = testData;
console.log("Destructured name:", destructuredName);
console.log("Rest:", rest);

// Template literals
const message = `Hello ${destructuredName}! You have ${numbers.length} numbers to work with.`;
console.log(message);

// Classes
class TestClass {
  constructor(name) {
    this.name = name;
  }
  
  greet() {
    return `Hello, ${this.name}!`;
  }
  
  static create(name) {
    return new TestClass(name);
  }
}

const instance = TestClass.create("World");
console.log(instance.greet());

// Main execution
async function main() {
  console.log("📊 Fetching mock data...");
  const data = await fetchMockData();
  console.log("Fetched data:", data);
  
  console.log("✅ Experiment completed!");
}

main().catch(console.error); 