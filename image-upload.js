class YuanImageUpload {
  constructor(uploadButton, options) {
    this.uploadButton = uploadButton;
    let fileControlId = uploadButton.getAttribute('data-for'),
        previewContainerId = uploadButton.getAttribute('data-preview'),
        inputControlId = uploadButton.getAttribute('data-input');
        
    this.fileControl = document.getElementById(fileControlId);
    // The div output where the content will be displayed.
    this.previewContainer = document.getElementById(previewContainerId);
    this.inputControl = document.getElementById(inputControlId);
    
    this.counter = YuanImageUpload.counter();
    
    this.parseOptions(options);
    this.addEventListeners();
  }
  
  parseOptions(options) {
    if (!options) return false;
    if (options.uploadURL) {
      this.uploadURL = options.uploadURL;
    }
    if (options.onPreview) {
      this.onPreview = options.onPreview;
    }
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
    
    this.previewContainer.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      let target = e.target,
          targetClassList = target.classList;
      if (targetClassList.contains("removeIcon")) {
        this.handleRemoveImage(target.parentElement);
      } else if (targetClassList.contains("imgContainer")) {
        this.previewImg(target.id);
      }
    });
  }
  
  // TODO
  previewImg(imgContainerId) {
    if (this.onPreview) {
      this.onPreview.call(this, imgContainerId);
    }
  }
  
  handleRemoveImage(imgContainer) {
    let imgid = imgContainer.getAttribute('data-imgid');
    imgContainer.parentNode.removeChild(imgContainer);
    let inputControlVal = this.inputControl.value.trim();
    if (inputControlVal) {
      let inputControlValArr = inputControlVal.split(";");
      let index = inputControlValArr.indexOf(imgid);
      if (index > -1) {
        inputControlValArr.splice(index, 1);
      }
      this.inputControl.value = inputControlValArr.join(";");
    }
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
      
      let fileLocalId = 'f' + this.counter();
      this.createImgContainer(file, fileLocalId);
      this.sendFile(file, fileLocalId);
    }
  }
  
  createImgContainer(file, fileLocalId) {
    let container = document.createElement("div");
    container.classList.add('imgContainer');
    container.id = fileLocalId;
    
    let removeIcon = document.createElement("img");
    removeIcon.src = "images/del.png";
    removeIcon.classList.add('removeIcon');
    
    let reader = new FileReader();
    reader.onload = function(e) { 
      container.style.backgroundImage = "url(" + e.target.result + ")";
    };
    reader.readAsDataURL(file);
    
    container.appendChild(removeIcon);
    this.previewContainer.appendChild(container); 
  }
  
  sendFile(file, fileLocalId) {
    let xhr = new XMLHttpRequest();
    let fd = new FormData();
    
    let responseTypeAware = 'responseType' in xhr;
    xhr.open("POST", this.uploadURL, true);
    if (responseTypeAware) {
      xhr.responseType = 'json';
    }
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        let responseJSON = responseTypeAware ? xhr.response : JSON.parse(xhr.responseText);
        this.handleUploadResponse(responseJSON, fileLocalId);// Handle response.
      }
    };
    fd.append('myFile', file);
    
    xhr.send(fd);// Initiate a multipart/form-data upload
  }
  
  handleUploadResponse(responseJSON, fileLocalId) {
    if (responseJSON.success) {
      if (this.inputControl.value) {
        this.inputControl.value += ';' + responseJSON.url;
      } else {
        this.inputControl.value = responseJSON.url;
      }
      document.getElementById(fileLocalId).setAttribute('data-imgid', responseJSON.url);
    } else {
      debugger;
    }
  }
  
  static counter() {
    var privateCounter = 0;
    return function() {
      return privateCounter++;
    };
  }
}