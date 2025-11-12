// mobile menu
const btn = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
btn.addEventListener("click", () => menu.classList.toggle("open"));
document.querySelectorAll(".menu a").forEach(link=>{
  link.addEventListener("click",()=>menu.classList.remove("open"));
});

// close menu when tapping outside (mobile)
document.addEventListener("click", (e) => {
  const navBox = document.querySelector(".menu");
  const toggleBtn = document.querySelector(".menu-toggle");

  // daca meniul e deschis si ai apasat in afara meniului si butonului
  if (menu.classList.contains("open") && !navBox.contains(e.target) && e.target !== toggleBtn) {
    menu.classList.remove("open");
  }
});


// popup
var popup = document.getElementById("cmd-popup");
var popup_txt = document.getElementById("cmd-popup-text");
var popup_close = document.getElementById("cmd-popup-close");
popup_close.addEventListener("click", ()=> popup.style.display = "none");
popup.addEventListener("click", (e) => { //sesam inchide te cand apesi altundeva
  if (e.target === popup) popup.style.display = "none";
});


if (window.cli_cmds) {
    var box = document.getElementById("cmd-menu");
    cli_cmds.forEach(function(c){
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#";
        a.textContent = c.name;
        a.addEventListener("click", function(){
            popup.style.display = "flex";
            popup_txt.textContent =
                c.name + "\n\n" +
                "desc: " + c.desc + "\n\n" +
                "manual:\n" + c.man;
        });
        li.appendChild(a);
        box.appendChild(li);
    });
}