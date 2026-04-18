//load progress from database
async function loadProgress() {
    const res = await fetch('http://localhost:3000/api/progress');
    const data = await res.json();
    points = data.points;
    const completed = JSON.parse(data.completed_tasks || '[]');
    document.querySelectorAll('input[type="checkbox"]').forEach((cb, i) => {
        cb.checked = completed.includes(i);
    });
    document.getElementById("points").innerHTML = "Points: " + points;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

let points = document.getElementById("points");
points = Number(points);

let tasksCompleted = document.querySelectorAll('input[type="checkbox"]:checked').length;

let button = document.getElementById("button");

document.addEventListener('change', function(e) {
    tasksCompleted = document.querySelectorAll('input[type="checkbox"]:checked').length;
    points = tasksCompleted * 10;
    console.log(points);
    document.getElementById("points").innerHTML = "Points: " + points;

    //save progress to database on checkbox change
    fetch('http://localhost:3000/api/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points, completedTasks: [...document.querySelectorAll('input[type="checkbox"]:checked')].map((cb, i) => i) })
    });

    //Update individual task boolean in tasks table
    if (e.target.type === 'checkbox') {
        const checkboxes = [...document.querySelectorAll('input[type="checkbox"]')];
        const taskId = checkboxes.indexOf(e.target) + 1;
        fetch('http://localhost:3000/api/update-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, completed: e.target.checked })
        });
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById("points").innerHTML = "Points: " + points;
    // ===== CHANGED: use quest-wrap instead of quest =====
    let quests = Array.from(document.getElementsByClassName("quest-wrap"));
    let button = document.getElementById("reset");
    let checkboxes = document.querySelectorAll('input[type="checkbox"]');
    let minigame1 = document.getElementById("game1");
    let minigame2 = document.getElementById("game2");
    let minigame3 = document.getElementById("game3");

    for (let i = 0; i < quests.length; i++) {
        quests[i].style.display = "none";
    }

    const questRes = await fetch('http://localhost:3000/api/daily-quests');
    const questData = await questRes.json();
    const today = new Date().toISOString().split('T')[0];

    if (!questData.date || questData.date.split('T')[0] !== today) {
        // New day — pick new random quests
        const selectedIds = [];
        for (let i = 0; i < 5; i++) {
            let randomInt = getRandomInt(quests.length - 1);
            quests[randomInt].style.display = "block";
            // ===== CHANGED: get id from the quest div inside quest-wrap =====
            selectedIds.push(quests[randomInt].querySelector('.quest').id);
            quests.splice(randomInt, 1);
        }
        // Save to database
        await fetch('http://localhost:3000/api/daily-quests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: today, questIds: selectedIds })
        });
    } else {
        // Same day — show saved quests from database
        const savedIds = JSON.parse(questData.quest_ids || '[]');
        savedIds.forEach(id => {
            // ===== CHANGED: find quest-wrap that contains the quest with this id =====
            const quest = document.getElementById(id);
            if (quest) quest.closest('.quest-wrap').style.display = "block";
        });
    }

    if (button) {
        button.addEventListener('click', function() {
            points = 0;
            checkboxes.forEach(function(checkbox) {
                checkbox.checked = false;
            });
            document.getElementById("points").innerHTML = "Points: " + 0;

            //reset progress in database
            fetch('http://localhost:3000/api/reset', { method: 'POST' });
        })
    }
    if (game1 || game2 || game3) {
        game1.addEventListener('click', function(e) {
            if (points - 10 < 0 && e.target.tagName === "A") {
                e.preventDefault();
                window.alert("Error: Not enough points to play the minigame. You need at least 10 points to play.");
            } else if (e.target.tagName === "A") {
                points -= 10;
                document.getElementById("points").innerHTML = "Points: " + points;
            }
        })
        game2.addEventListener('click', function(e) {
            if (points - 10 < 0 && e.target.tagName === "A") {
                e.preventDefault();
                window.alert("Error: Not enough points to play the minigame. You need at least 10 points to play.");
            } else if (e.target.tagName === "A") {
                points -= 10;
                document.getElementById("points").innerHTML = "Points: " + points;
            }
        })
        game3.addEventListener('click', function(e) {
            if (points - 10 < 0 && e.target.tagName === "A") {
                e.preventDefault();
                window.alert("Error: Not enough points to play the minigame. You need at least 10 points to play.");
            } else if (e.target.tagName === "A") {
                points -= 10;
                document.getElementById("points").innerHTML = "Points: " + points;
            }
        })
    }
    loadProgress();
});