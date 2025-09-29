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

//Function to check if a date is a holiday or a December Shutdown
function isNonWorkingDay(date){
    const formattedDate = date.toISOString().split("T")[0];
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    //is the day a weekend?
    if(day === 0 || day === 6){
        return true;
    }

    //is the day a public holiday?
    if(publicHolidays.includes(formattedDate)){
        return true;
    }

    //is the day a December shutdown?
    const shutdownStart = new Date(decemberShutdownStart);
    const shutdownEnd = new Date(decemberShutdownEnd);
    
    if(date >= shutdownStart && date <= shutdownEnd){
        return true;
    }

    //if the date is not a weekend, nor a public holiday, nor a December shutdown then it is a working day.
    //So, false to all of those conditions
    return false;
}

//Adds working days to a date
//This function ensures that only working days count when adding durations. 
//Holidays, weekends, and shutdown days are automatically skipped.
function addWorkingDays(startDate, daysToAdd){
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while(addedDays < daysToAdd){
        currentDate.setDate(currentDate.getDate() + 1);
        if(!isNonWorkingDay(currentDate)){ // if the day is a working day
            addedDays++;
        }
    }
    return currentDate;
}

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

function generateTimeline(startDateStr, modules) {
    let currentDate = new Date(startDateStr);
    const timeline = [];

    modules.forEach(mod => {
        const start = currentDate;
        const end = addWorkingDays(start, mod.duration - 1); // inclusive
        timeline.push({
            block: mod.block,
            module: mod.module,
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
            tr.innerHTML = `<td>${row.block}</td><td>${row.module}</td><td>${row.start}</td><td>${row.end}</td>`;
            tbody.appendChild(tr);
        });
    });
});
