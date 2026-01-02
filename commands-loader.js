fetch("commands.json")
  .then(r => r.json())
  .then(data => {
    window.cli_cmds = data;
  })
  .catch(() => {
    window.cli_cmds = [];
  });
