var screen = document.getElementById("screen");
var input = document.getElementById("cmdline");
var prompt_el = document.getElementById("prompt");
var side_user = document.getElementById("side-user");
var side_count = document.getElementById("side-count");
var pill = document.getElementById("session-pill");
var cmd_history = [];
var cmd_history = (localStorage.getItem("history") || "").split("\n");
if (cmd_history.length == 1 && cmd_history[0] == "") cmd_history = [];
var hist_index = -1;
var cmd_total = 0;
var cli_cmds = window.cli_cmds || [];
var cmds = cli_cmds.map(function (x) { return x.name; });
var sess = JSON.parse(localStorage.getItem("sess") || "{}");
var vimLoading = document.getElementById("vim-loading");
var vimUI = document.getElementById("vim-ui");
var modal = document.getElementById("root-modal");
var box = document.getElementById("root-box");
var closeb = document.getElementById("root-close");
var rootmsg = document.getElementById("root-msg");

function close_root() {
  modal.style.display = "none";
  input.focus();
}

closeb.addEventListener("click", close_root);
modal.addEventListener("click", close_root);

// am folosit si stopPropagation
box.addEventListener("click", function (e) {
  e.stopPropagation();
});

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
  if (sess.user) { //restaurare sesiune
    prompt_el.textContent = sess.user + "@cli:~$";
    side_user.textContent = sess.user;
    pill.textContent = sess.isAdmin ? "root" : sess.user;
  }
}

function set_theme() {
  getComputedStyle(document.body).color;

  if (sess.isAdmin) {
    document.documentElement.style.setProperty("--verdehacker", "#ff3333");
  } else {
    document.documentElement.style.setProperty("--verdehacker", "#00ff00");
  }
}

set_theme();

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
  } else if (cmd == "clear") {
    screen.innerHTML = "";
  } else if (cmd == "echo") {
    print_line(args.join(" "));
  } else if (cmd == "user") {
    if (!args[0]) {
      print_line("usage: user <name>");
    } else {
      var name = args[0];

      if (name == "root") {
        open_root();
        return;
      }

      prompt_el.textContent = name + "@cli:~$";
      side_user.textContent = name;
      pill.textContent = name;
      print_line("user set to " + name);

      sess.user = name;
      sess.isAdmin = false;
      localStorage.setItem("sess", JSON.stringify(sess));
      set_theme();
    }
  } else if (cmd == "man") {
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
  } else if (cmd == "history") {
    if (cmd_history.length == 0) print_line("(empty)");
    else {
      for (var i = 0; i < cmd_history.length; i++) {
        print_line(i + 1 + "  " + cmd_history[i]);
      }
    }
  } else if (cmd == "matrix") {
    run_matrix();
  } else if (cmd == "pets") {
    if (!sess.isAdmin) {
      print_line("permission denied");
      return;
    }

    if (!pet_list) {
      load_pets(function () {
        var pick = pet_list[Math.floor(Math.random() * pet_list.length)];
        make_pet(pick);
      });
    } else {
      var pick = pet_list[Math.floor(Math.random() * pet_list.length)];
      make_pet(pick);
    }

  } else {
    print_line("command not found: " + cmd);
  }
}

input.addEventListener("keydown", function (e) {

  // la enter executam comanda
  if (e.key == "Enter") {
    var t = input.value;
    input.value = "";

    if (t.trim()) {
      cmd_history.push(t);
      localStorage.setItem("history", cmd_history.join("\n")); // si adaug in history
      hist_index = cmd_history.length;
    }

    run_cmd(t);
    return;
  }

  // HISTORY UP
  if (e.key == "ArrowUp") {
    e.preventDefault();
    if (hist_index > 0) hist_index--;
    input.value = cmd_history[hist_index] || "";
    return;
  }

  // HISTORY DOWN
  if (e.key == "ArrowDown") {
    e.preventDefault();
    if (hist_index < cmd_history.length - 1) hist_index++;
    else hist_index = cmd_history.length;

    input.value = cmd_history[hist_index] || "";
    return;
  }

  // TAB autocomplete
  if (e.key == "Tab") {
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

function run_matrix() {
  ///totally didn't "take inspiration" from https://codepen.io/yaclive/pen/EayLYO
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

    var col = getComputedStyle(document.documentElement).getPropertyValue(
      "--verdehacker"
    );
    ctx.fillStyle = col;

    for (var i = 0; i < drops.length; i++) {
      var txt = letters[Math.floor(Math.random() * letters.length)];
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

var pet_list = null;

function load_pets(cb) {
  fetch("pets-claudia.txt")
    .then((r) => r.text())
    .then((t) => {
      pet_list = t
        .split(/\n\s*\n\s*\n+/)
        .map((x) => x.replace(/\s+$/g, "")) // only remove trailing whitespace
        .filter((x) => x.length > 0);
      cb();
    })
    .catch(() => {
      print_line("cant load pets-claudia.txt");
    });
}

function heart(x, y) {
  var s = document.createElement("span");
  s.textContent = "<3";
  s.style.position = "fixed";
  s.style.left = x + "px";
  s.style.top = y + "px";
  s.style.pointerEvents = "none";
  s.style.opacity = "1";
  s.style.transition = "opacity 0.6s, transform 0.6s";
  s.style.transform = "translate(-50%,-50%)";
  s.style.color = getComputedStyle(document.documentElement).getPropertyValue(
    "--verdehacker"
  );
  document.body.appendChild(s);

  setTimeout(function () {
    s.style.opacity = "0";
    s.style.transform = "translate(-50%,-90%)";
  }, 10);

  setTimeout(function () {
    s.remove();
  }, 650);
}

function make_pet(txt) {
  var pre = document.createElement("pre");
  pre.textContent = txt;
  pre.className = "pet";
  screen.appendChild(pre);
  screen.scrollTop = screen.scrollHeight;

  var down = false;
  var last = 0;

  pre.addEventListener("mousedown", function () {
    down = true;
    pre.style.cursor = "grabbing";
  });

  document.addEventListener("mouseup", function () {
    down = false;
    pre.style.cursor = "pointer";
    pre.style.transform = "rotate(0deg)";
  });

  pre.addEventListener("mousemove", function (e) {
    if (!down) return;

    var dx = e.movementX || 0;
    var ang = dx;
    if (ang > 4) ang = 4;
    if (ang < -4) ang = -4;

    pre.style.transform = "rotate(" + ang + "deg)";

    var now = Date.now();
    if (now - last > 120) {
      last = now;
      heart(e.clientX, e.clientY);
    }
  });
}

screen.addEventListener("click", function () {
  input.focus();
});

// VIM CAPTCHA THINGY

var vimScreen = document.getElementById("vim-screen");
var vimStatus = document.getElementById("vim-status");
var vimCmdLine = document.getElementById("vim-cmdline");
var vimCmdText = document.getElementById("vim-cmdtext");

var vim_mode = "normal"; // normal insert cmd
var vim_buf = "";
var vim_cmd = "";

function vim_render() {
  vimScreen.textContent = vim_buf;

  if (vim_mode == "insert") vimStatus.textContent = "-- INSERT --";
  else vimStatus.textContent = "-- NORMAL --";

  if (vim_mode == "cmd") {
    vimCmdLine.style.display = "flex";
    vimCmdText.textContent = vim_cmd;
  } else {
    vimCmdLine.style.display = "none";
    vimCmdText.textContent = "";
  }
}

function open_root() { // fake login: show loading bar, then open the vim mini game / captcha thingy
  rootmsg.textContent = "";
  modal.style.display = "flex";

  // show loading
  vimLoading.style.display = "flex";
  vimUI.style.display = "none";

  // restart fill animation
  var fill = vimLoading.querySelector(".fill");
  fill.style.animation = "none";
  fill.offsetHeight; // kinda resets the animation
  fill.style.animation = "fillbar 2s linear forwards";

  setTimeout(function () {
    vimLoading.style.display = "none";
    vimUI.style.display = "block";

    vim_mode = "normal";
    vim_buf = "";
    vim_cmd = "";
    vim_render();
  }, 2000);
}

function become_root() { // if vim passed, set admin session + change theme to bloody red
  sess.user = "root";
  sess.isAdmin = true;
  sess.lastLogin = new Date().toString();
  localStorage.setItem("sess", JSON.stringify(sess));

  prompt_el.textContent = "root@cli:~$";
  side_user.textContent = "root";
  pill.textContent = "root";

  set_theme();
  close_root();
  print_line("you can exit vim, you must be the sysadmin...");
}

document.addEventListener("keydown", function (e) {
  if (modal.style.display != "flex") return;

  e.preventDefault();

  if (vim_mode == "insert") {
    if (e.key == "Escape") {
      vim_mode = "normal";
      vim_render();
      return;
    }
    if (e.key == "Backspace") {
      vim_buf = vim_buf.slice(0, -1);
      vim_render();
      return;
    }
    if (e.key == "Enter") {
      vim_buf += "\n";
      vim_render();
      return;
    }
    if (e.key.length == 1) {
      vim_buf += e.key;
      vim_render();
      return;
    }
    return;
  }

  if (vim_mode == "normal") {
    if (e.key == "i") {
      vim_mode = "insert";
      vim_render();
      return;
    }
    if (e.key == ":") {
      vim_mode = "cmd";
      vim_cmd = "";
      vim_render();
      return;
    }
    return;
  }

  if (vim_mode == "cmd") {
    if (e.key == "Escape") {
      vim_mode = "normal";
      vim_render();
      return;
    }
    if (e.key == "Backspace") {
      vim_cmd = vim_cmd.slice(0, -1);
      vim_render();
      return;
    }
    if (e.key == "Enter") {
      var re = /^wq$/; // just checking what they typed w regex
      if (re.test(vim_cmd) && /hello world/i.test(vim_buf)) {
        become_root();
      } else {
        vim_mode = "normal";
        vim_render();
      }
      return;
    }
    if (e.key.length == 1) {
      vim_cmd += e.key;
      vim_render();
      return;
    }
  }
});
