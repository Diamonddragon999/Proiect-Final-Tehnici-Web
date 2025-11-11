var screen = document.getElementById("screen");
var input = document.getElementById("cmdline");
var prompt_el = document.getElementById("prompt");
var side_user = document.getElementById("side-user");
var side_count = document.getElementById("side-count");
var pill = document.getElementById("session-pill");

var cmd_history = [];
var hist_index = -1;
var cmd_total = 0;

var cli_cmds = [
    {name: "help",      desc: "show commands",  man: "help - list all commands"},
    {name: "clear",     desc: "clear screen",   man: "clear - wipes the terminal"},
    {name: "echo",      desc: "print text",     man: "echo <text> - prints text"},
    {name: "user",      desc: "change user",    man: "user <name> - change prompt user"},
    {name: "man",       desc: "manual",         man: "man <cmd> - shows help for a command"},
    {name: "history",   desc: "show history",   man: "history - show typed commands"},
    {name: "matrix",    desc: "matrix effect",  man: "matrix - red or blue pill?"}
];

// lista pt autocomplete
var cmds = cli_cmds.map(function(x){ return x.name; });

function print_line(txt) {
    var p = document.createElement("p");
    p.textContent = txt;
    screen.appendChild(p);
    screen.scrollTop = screen.scrollHeight;
}

function update_count() {
    side_count.textContent = cmd_total;
}

function boot() {
    print_line("Cyber Ops Terminal 1.0");
    print_line("session user: anonymous");
    print_line('type "help" for available commands');
    print_line("");
    input.focus();
}

boot();

function run_cmd(raw) {
    var line = raw.trim();
    if (line == "") return;

    cmd_total = cmd_total + 1;
    update_count();

    print_line(prompt_el.textContent + " " + line);

    var parts = line.split(" ");
    var cmd = parts[0];
    var args = parts.slice(1);

    if (cmd == "help") {
        for (var i = 0; i < cli_cmds.length; i++) {
            var c = cli_cmds[i];
            print_line(c.name + " - " + c.desc);
        }
    }

    else if (cmd == "clear") {
        screen.innerHTML = "";
    }

    else if (cmd == "echo") {
        print_line(args.join(" "));
    }

    else if (cmd == "user") {
        if (!args[0]) {
            print_line("usage: user <name>");
        } else {
            var name = args[0];
            prompt_el.textContent = name + "@cli:~$";
            side_user.textContent = name;
            pill.textContent = name;
            print_line("user set to " + name);
        }
    }

    else if (cmd == "man") {
        var q = args[0];
        if (!q) {
            print_line("usage: man <command>");
        } else {
            var found = false;
            for (var i = 0; i < cli_cmds.length; i++) {
                if (cli_cmds[i].name == q) {
                    print_line(cli_cmds[i].man);
                    found = true;
                    break;
                }
            }
            if (!found) print_line("no manual entry for " + q);
        }
    }

    else if (cmd == "history") {
        if (cmd_history.length == 0) print_line("(empty)");
        else {
            for (var i = 0; i < cmd_history.length; i++) {
                print_line((i + 1) + "  " + cmd_history[i]);
            }
        }
    }

    else if (cmd == "matrix") {
        run_matrix();
    }

    else {
        print_line("command not found: " + cmd);
    }
}

input.addEventListener("keydown", function (e) {
    if (e.key == "Enter") {
        var t = input.value;
        input.value = "";
        if (t.trim() != "") {
            cmd_history.push(t);
            hist_index = cmd_history.length;
        }
        run_cmd(t);
    }

    else if (e.key == "ArrowUp") {
        e.preventDefault();
        if (cmd_history.length > 0) {
            if (hist_index > 0) hist_index--;
            input.value = cmd_history[hist_index] || "";
        }
    }

    else if (e.key == "ArrowDown") {
        e.preventDefault();
        if (cmd_history.length > 0) {
            if (hist_index < cmd_history.length - 1) {
                hist_index++;
                input.value = cmd_history[hist_index] || "";
            } else {
                hist_index = cmd_history.length;
                input.value = "";
            }
        }
    }

    else if (e.key == "Tab") {
        e.preventDefault();
        var cur = input.value.trim();
        if (!cur) return;
        for (var i = 0; i < cmds.length; i++) {
            if (cmds[i].indexOf(cur) == 0) {
                input.value = cmds[i] + " ";
                break;
            }
        }
    }
});

function run_matrix() { ///totally didn't "take inspiration" from https://codepen.io/yaclive/pen/EayLYO
    var c = document.createElement("canvas");
    c.id = "matrix";
    c.style.position = "fixed";
    c.style.top = "0";
    c.style.left = "0";
    c.style.width = "100vw";
    c.style.height = "100vh";
    c.style.zIndex = "9999999";
    document.body.appendChild(c);

    var ctx = c.getContext("2d");
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    var letters = "ABCDEFGHIJKLMNOPQRSTUVXYZ0123456789".split("");
    var font = 12;
    var cols = c.width / font;
    var drops = [];
    for (var i = 0; i < cols; i++) drops[i] = 1;

    function draw() {
        ctx.fillStyle = "rgba(0,0,0,0.07)";
        ctx.fillRect(0, 0, c.width, c.height);

        for (var i = 0; i < drops.length; i++) {
            var txt = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillStyle = "#0f0";
            ctx.fillText(txt, i * font, drops[i] * font);
            drops[i]++;
            if (drops[i] * font > c.height && Math.random() > 0.95) drops[i] = 0;
        }
    }

    var interval = setInterval(draw, 35);

    document.addEventListener("keydown", function k(e) {
        if (e.key == "Escape") {
            clearInterval(interval);
            document.removeEventListener("keydown", k);
            c.remove();
        }
    });
}

screen.addEventListener("click", function () {
    input.focus();
});
