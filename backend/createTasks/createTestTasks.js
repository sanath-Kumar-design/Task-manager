import fetch from "node-fetch";

const userId = "68e244daaf4ad3667d67335a"; // test user ID
const numberOfTasks = 20; // number of tasks to create

function randomTitle(i) {
    return `Test Task ${i}`;
}

function randomDescription() {
    const options = ["Do something", "Complete this", "Check this", "Review task"];
    return options[Math.floor(Math.random() * options.length)];
}

async function createTask(taskData) {
    const res = await fetch("http://localhost:5000/create-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData)
    });

    const data = await res.json();
    console.log(data.message || data);
}

(async () => {
    for (let i = 1; i <= numberOfTasks; i++) {
        const task = {
            taskTitle: randomTitle(i),
            taskDescription: randomDescription(),
            assignedTo: ['68e244daaf4ad3667d67335a'],
            priority: ["High", "Medium", "Low"][Math.floor(Math.random() * 3)],
            dueDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: userId
        };
        await createTask(task);
    }
})();
