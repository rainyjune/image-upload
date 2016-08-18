class YuanImageUpload {
  constructor(uploadButton, options) {
    this.uploadButton = uploadButton;
    let fileControlId = uploadButton.getAttribute('data-for'),
        previewContainerId = uploadButton.getAttribute('data-preview');
    this.fileControl = document.getElementById(fileControlId);
    this.previewContainer = document.getElementById(previewContainerId);
    
    this.addEventListeners();
  }
  
  addEventListeners() {
    this.uploadButton.addEventListener('click', (e) => {
      this.fileControl.click();
      e.preventDefault();
      e.stopPropagation();
    }, false);
    
    this.fileControl.addEventListener('change', (e) => {
      this.handleFiles();
      e.preventDefault();
      e.stopPropagation();
    }, false);
  }
  
  handleFiles() {
    let files = this.fileControl.files,
        fileLength = files.length;
    debugger;
    for (var i = 0; i < fileLength; i++) {
      var file = files[i];
      var imageType = /^image\//;
      
      if (!imageType.test(file.type)) {
        continue;
      }
      
      var img = document.createElement("img");
      //img.classList.add("obj");
      img.file = file;
      this.previewContainer.appendChild(img); // Assuming that "preview" is the div output where the content will be displayed.
      
      var reader = new FileReader();
      reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
      reader.readAsDataURL(file);
    }
  }
}