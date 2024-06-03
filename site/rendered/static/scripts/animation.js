const paragraphs = document.querySelectorAll(".container > *");

paragraphs.forEach((paragraph, index) => {
  paragraph.style.animationDelay = `${index * 0.03}s`;
  // animation duration increases with each paragraph
  // paragraph.style.animationDuration = `${0.08 + index * 0.05}s`;
});
