class YuanImageUpload {
  constructor(uploadButton, options) {
    this.uploadButton = uploadButton;
    let fileControlId = uploadButton.getAttribute('data-for'),
        previewContainerId = uploadButton.getAttribute('data-preview');
    this.fileControl = document.getElementById(fileControlId);
    // The div output where the content will be displayed.
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
        
    for (let i = 0; i < fileLength; i++) {
      let file = files[i];
      let imageType = /^image\//;
      
      if (!imageType.test(file.type)) {
        continue;
      }
      this.createImgContainer(file);
    }
  }
  
  createImgContainer(file) {
    let container = document.createElement("div");
    container.classList.add('imgContainer');
    
    let img = document.createElement("img");
    img.classList.add("thumbnail");
    img.file = file;
    
    let reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
    
    container.appendChild(img);
    this.previewContainer.appendChild(container); 
  }
}