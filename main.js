const publicHolidays = [
    '2025-01-01', // New Year's Day
    '2025-03-21', // Human Rights Day
    '2025-04-18', // Good Friday
    '2025-04-21', // Family Day
    '2025-04-27', //Freedom Day
    '2025-04-28', //Public holiday Freedom Day observed
    '2025-05-01', // Workers Day
    '2025-06-16', // Youth Day
    '2025-08-09', // National Women's Day
    '2025-09-24', // Heritage Day
    '2025-12-16', // Day of Reconciliation
    '2025-12-25', // Christmas
    '2025-12-26'  // Day of Goodwill
];

const decemberShutdownStart = '2025-12-15';
const decemberShutdownEnd = '2026-01-05';

/**
 * Checks if a given date is a non-working day
 * Non-working days include weekends (Saturday & Sunday),
 * South African public holidays, and the December shutdown period
 * @param {Date} date 
 * @returns {boolean} - Returns true if the day is a non-working day, otherwise false.
 */
function isNonWorkingDay(date){
    const formattedDate = date.toISOString().split("T")[0];
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    if(day === 0 || day === 6){
        return true;
    }

    //is the day a public holiday?
    if(publicHolidays.includes(formattedDate)){
        return true;
    }

    const shutdownStart = new Date(decemberShutdownStart);
    const shutdownEnd = new Date(decemberShutdownEnd);
    
    if(date >= shutdownStart && date <= shutdownEnd){
        return true;
    }

    return false;
}

/**
 * Adds a specified number of working days to a given start date for a module
 * Skips weekends, public holidays, and the December shutdown.
 * This function counts the day that the module starts as the first day.
 * @param {Date|String} startDate - Starting date 
 * @param {number} daysToAdd - Number of working days to add
 * @returns {Date} - End date after adding the working days
 */
function addWorkingDays(startDate, daysToAdd){
    let currentDate = new Date(startDate);
    let addedDays = 0;


    //The question now is, when a module starts, does the day it starts count as the first day? Or 
    // do we start counting from the next day?
    while(addedDays < daysToAdd){
        if(!isNonWorkingDay(currentDate)){ // if the day is a working day
            addedDays++;
        }
        if(addedDays < daysToAdd){
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    return currentDate;
}



/**
 * Adds a specified number of working days to a given start date for a module
 * Skips weekends, public holidays, and the December shutdown
 * This function counts the next day after the module starts the first day.

 * @param {Date|String} startDate - Starting date 
 * @param {number} daysToAdd - Number of working days to add
 * @returns {Date} - End date after adding the working days
 */
function addWorkingDays(startDate, daysToAdd){
    let currentDate = new Date(startDate);
    let addedDays = 0;


    //The question now is, when a module starts, does the day it starts count as the first day? Or 
    // do we start counting from the next day?
    while(addedDays < daysToAdd){
        currentDate.setDate(currentDate.getDate() + 1);
        if(!isNonWorkingDay(currentDate)){ // if the day is a working day
            addedDays++;
        }
    }
    return currentDate;
}

console.log(`Adding 2 days from Feb 14th is: ${addWorkingDays('2025-02-10', 2)}`);

/**
 * Parses a CSV file, and converts it into an array of module objects
 * Each object contains a block name, module name, and duration days
 * @param {*} file - CSV file uploaded by the user
 * @param {*} callback - function called with the parsed array
 */
function parseCSVFile(file, callback){
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.trim().split("\n");
        const result = lines.splice(1).map(line =>{
            const [block, module, duration] = line.split(",");
            return {block, module, duration: parseInt(duration)}
        });
        callback(result);
    };
    reader.readAsText(file);
}

function formatDuration(days){
    const weeks = Math.floor(days / 5);
    const remainder = days % 5;
    
    let parts = [];
    if(weeks > 0){
        parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    }
    if(remainder > 0){
        parts.push(`${remainder} day${remainder > 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(' and ') : '0 days';
}

/**
 * Generates a bootcamp timeline based on start date and modules
 * Calculates start and end dates for each module using working days
 * @param {Date|String} startDateStr - Start date for the bootcamp
 * @param {Array} modules - Array of objects with {block, module, duration}
 * @returns {Array} - Array of objects with {block, module, start date, end date}
 */
function generateTimeline(startDateStr, modules) {
    let currentDate = new Date(startDateStr);
    const timeline = [];

    modules.forEach(mod => {
        const start = currentDate;
        const end = addWorkingDays(start, mod.duration - 1); // inclusive
        timeline.push({
            block: mod.block,
            module: mod.module,
            duration: formatDuration(mod.duration),
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        currentDate = addWorkingDays(end, 1); // Next module starts after current
    });

    return timeline;
}

document.getElementById('generateBtn').addEventListener('click', () => {
    const startDate = document.getElementById('startDate').value;
    const file = document.getElementById('csvFile').files[0];

    if (!startDate || !file) {
        alert('Please provide a start date and upload a CSV file.');
        return;
    }

    parseCSVFile(file, modules => {
        const timeline = generateTimeline(startDate, modules);
        const tbody = document.querySelector('#timelineTable tbody');
        tbody.innerHTML = ''; // Clear previous results

        timeline.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${row.block}</td>
            <td>${row.module}</td>
            <td>${row.duration}</td>
            <td>${row.start}</td>
            <td>${row.end}</td>`;
            tbody.appendChild(tr);
        });
    });
});
