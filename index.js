(()=>{
  let ConvertStringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');
    return doc.body;
  };

  class RuntimeBinding{
    console = {
      log: this.log
    };

    log(msg){
      nativeCLog(msg);
      const console = document.querySelector(".console");
      msg += "\n";
      msg = msg.replace("\n", "<br>");
      console.innerHTML += msg;
    }
  }

  const rb = new RuntimeBinding();

  const nativeCLog = window.console.log;
  window.console.log = rb.console.log;

  async function main() {
    const textarea = document.querySelector("textarea");
    const error = document.querySelector(".error");
    const run = document.querySelector(".run");

    let pyodide = await loadPyodide.bind(rb)({
      indexURL : "https://cdn.jsdelivr.net/pyodide/v0.20.0/full/"
    });

    pyodide.loadPackage("scikit-learn", e=>{
      rb.console.log(e);
    },e=>{
      rb.console.error(e);
    });

    run.addEventListener("click", e=>{
      rb.console.log("");
      rb.console.log("running script...");
      try{
        let msg = pyodide.runPython(textarea.value);
      }catch(e){
        error.innerHTML = error;
      }
    });

  }


  window.addEventListener("load", main);
})();
