// get a deep template literal value that might not exist

module.exports = (root, keyArr) => {
  if(root){
    for(let i=0; i<keyArr.length; i++){
      root = root[keyArr[i]]
      if(!root){
        return false
      }
    }
    return root
  }else{
    return false
  }
}
