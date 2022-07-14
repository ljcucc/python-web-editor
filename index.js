(()=>{
  let ConvertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
  };

  let editor;

  class RuntimeBinding{
    console = {
      log: this.log,
      error: this.error,
      clear: this.clear
    };

    clear(){
      const console = document.querySelector(".console");
      console.innerHTML = "";

      const error = document.querySelector(".error");
      error.innerHTML = "";
    }

    log(msg){
      nativeCLog(msg);
      const console = document.querySelector(".console");

      msg += "\n";
      msg = msg.replace("\n", "<br>");
      console.innerHTML += msg;

      const consolePanel = document.querySelector("#consolePanel");
      consolePanel.scrollTop = consolePanel.scrollHeight;
    }

    error(msg){
      const console = document.querySelector(".error");
      msg += "\n";
      msg = msg.replace("\n", "<br>");
      console.innerHTML += msg;

      const consolePanel = document.querySelector("#consolePanel");
      consolePanel.scrollTop = consolePanel.scrollHeight;
    }
  }

  const rb = new RuntimeBinding();

  const nativeCLog = window.console.log;
  window.console.log = rb.console.log;

  async function main() {
    const textarea = document.querySelector("#editor");
    editor = textarea;

    const error = document.querySelector(".error");

    const run = document.querySelector(".run");
    const clearBtn = document.querySelector(".button.clear");

    let pyodide = await loadPyodide.bind(rb)({
      indexURL : "https://cdn.jsdelivr.net/pyodide/v0.20.0/full/"
    });

    ["scikit-learn", "micropip"].forEach(item=>{
      rb.console.log(`importing ${item}\n`);
      pyodide.loadPackage(item, e=>{
        rb.console.log(e);
      },e=>{
        rb.console.error(e);
      });
    });

    run.addEventListener("click", e=>{
      rb.console.log("");
      rb.console.log("running script...");
      try{
        let msg = pyodide.runPython(textarea.value);
      }catch(e){
        rb.console.error(e);
      }
    });

    clearBtn.addEventListener("click", e=>{
      clearConsole();
    });

  }

  function clearConsole(){
    rb.console.clear();
    rb.console.log("...");
  }

  window.addEventListener("load", main);

  (()=>{
    let butOpenFile;
    let fileHandle;

    window.addEventListener("load", e=>{
      butOpenFile = document.querySelector(".button.open");
      butOpenFile.addEventListener('click', async () => {
        // Destructure the one-element array.
        [fileHandle] = await window.showOpenFilePicker();
        // Do something with the file handle.
        const file = await fileHandle.getFile();
        const contents = await file.text();

        editor.value = contents;

      });
    });
  })();

})();
