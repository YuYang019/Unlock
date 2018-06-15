export const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas')
  // 不能用style.width，而是设置它的width属性
  canvas.width = width
  canvas.height = height
  canvas.style.position = 'absolute'
  canvas.style.top = 0
  canvas.style.left = 0

  return canvas
}
