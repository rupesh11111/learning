const fs = require('fs');
console.log("start")
setTimeout(() => console.log('Timeout1'));
setImmediate(() => console.log('Immediate1'));
fs.readFile(__filename, () => {
    console.log('C');
    setTimeout(() => console.log('Timeout2'));
    setImmediate(() => console.log('Immediate2'));
    Promise.resolve().then(() => console.log('Promise2'));
    process.nextTick(() => console.log('nextTick2'));    
});
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));
console.log("end")