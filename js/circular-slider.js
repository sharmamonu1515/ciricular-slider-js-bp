// https://1ucius.github.io/circular-slider/

(function () {
  "use strict";

  function startSetup(sliderSize, slideSize, animationDuration, autoplayInterval) {
    this.sliderSize = parseFloat(sliderSize) / 100;
    this.slideSize = parseFloat(slideSize) / 100;
    this.animationDuration = parseFloat(animationDuration);
    this.autoplayInterval = parseFloat(autoplayInterval);
  }

  function Slider(newSlider, sliderSize, slideSize, animationDuration, autoplayInterval) {
    (this.startSetup = new startSetup(sliderSize, slideSize, animationDuration, autoplayInterval)), (this.wrapper = newSlider.querySelector(".wrapper"));

    this.slider = newSlider;

    this.slides = newSlider.querySelectorAll(".circular-slider .wrapper .slides-holder .slides-holder__item");
    this.descriptionsHolder = newSlider.querySelector(".circular-slider .wrapper .descriptions");
    this.descriptions = newSlider.querySelectorAll(".circular-slider .wrapper .descriptions .descriptions__item");
    this.slidesHolder = newSlider.querySelector(".circular-slider .wrapper .slides-holder");
    this.btnLeft = newSlider.querySelector(".circular-slider .wrapper .controls .controls__left");
    this.btnRight = newSlider.querySelector(".circular-slider .wrapper .controls .controls__right");
    this.btnAutoplay = newSlider.querySelector(".circular-slider .wrapper .controls .controls__autoplay");

    this.onResize();
    this.setAutoplay();
    this.setNav();
    this.addStyle();
    this.init();
  }

  Slider.prototype.isDesktop = function () {
    return window.innerWidth > 1024;
  };

  Slider.prototype.init = function () {
    this.isAnimating = false;
    this.slidesHolder.style.transitionDuration = this.startSetup.animationDuration + "ms";
    this.initClickFeature();
    // this.initDragFeature();
    this.initAutoplay();
  };

  Slider.prototype.onResize = function (windowResized = false) {
    this.slidesSize = 0;
    this.currentSlide = 0;
    this.currentAngle = 0;

    if (this.isDesktop()) {
      this.slides = this.slider.querySelectorAll(".circular-slider .wrapper .slides-holder .slides-holder__item");
      this.slider.querySelectorAll(".circular-slider .wrapper .slides-holder .slides-holder__item[data-item='mobile']").forEach((el) => (el.style.display = "block"));
    } else {
      this.slides = this.slider.querySelectorAll(".circular-slider .wrapper .slides-holder .slides-holder__item:not([data-item='mobile'])");
      this.slider.querySelectorAll(".circular-slider .wrapper .slides-holder .slides-holder__item[data-item='mobile']").forEach((el) => (el.style.display = "none"));
    }

    this.stepAngle = (2 * Math.PI) / this.slides.length;

    // add active class to first element
    this.slider.querySelector(".slides-holder__item_active").classList.remove("slides-holder__item_active");
    this.slider.querySelector(".descriptions__item_visible").classList.remove("descriptions__item_visible");

    this.slides[0].classList.add("slides-holder__item_active");
    this.descriptions[0].classList.add("descriptions__item_visible");

    if (windowResized) {
      this.slidesHolder.removeAttribute("style");

      this.init();
    }

    let radius,
      w = this.wrapper.parentNode.getBoundingClientRect().width,
      h = this.wrapper.parentNode.getBoundingClientRect().height;

    2 * h <= w ? (radius = h * this.startSetup.sliderSize) : (radius = (w / 2) * this.startSetup.sliderSize);

    this.setSize(Math.round(radius));
  };

  Slider.prototype.setSize = function (radius) {
    this.wrapper.style.width = 2 * radius + "px";

    // added by ak
    this.wrapper.style.height = (this.isDesktop() ? radius : radius / 0.5) + "px";
    // this.wrapper.style.height = (radius / 0.45) + "px";

    let r = 2 * radius * (1 - this.startSetup.slideSize);
    this.slidesHolder.style.width = this.slidesHolder.style.height = r / (this.isDesktop() ? 1 : 2) + "px";
    this.slidesRepositioning(r / (this.isDesktop() ? 2 : 4));

    this.slidesHolder.style.marginTop = this.isDesktop() ? -(radius * (this.startSetup.slideSize * 10)) + "px" : 0;

    this.descriptionsHolder.style.width = (r / 2 - r * this.startSetup.slideSize + 20) * 2 + "px";
    this.descriptionsHolder.style.height = r / 2 - r * this.startSetup.slideSize + 20 + "px";

    this.slidesSize = Math.min(2 * radius * this.startSetup.slideSize, this.stepAngle * radius * (1 - this.startSetup.slideSize) - 50);
    this.descriptionsHolder.style.fontSize = window.innerHeight < window.innerWidth ? "1.2vh" : "1.2vw";
    for (let i = 0; i < this.slides.length; i++) {
      // commented by ak
      //   this.slides[i].style.width = this.slides[i].style.height = this.slidesSize + "px";
      this.slides[i].style.width = this.slidesSize + "px";
    }
  };

  Slider.prototype.slidesRepositioning = function (r) {
    for (let i = 0; i < this.slides.length; i++) {
      let x = r * Math.cos(this.stepAngle * i + Math.PI / 2),
        y = r * Math.sin(this.stepAngle * i + Math.PI / 2);

      this.slides[i].style.transform = "translate( " + x + "px, " + y + "px ) rotate( " + ((this.stepAngle * 180) / Math.PI) * i + "deg )";
    }
  };

  Slider.prototype.rotate = function (multiplier) {
    let _this = this;

    if (this.isAnimating) return;

    this.isAnimating = true;

    this.removeStyle();
    this.resetNavs();

    if (this.currentSlide === this.slides.length - 1 && multiplier === -1) {
      this.slidesHolder.style.transform = "rotate( -360deg )";
      this.currentSlide = this.currentAngle = 0;
      this.addStyle();

      setTimeout(function () {
        _this.slidesHolder.style.transitionDuration = 0 + "s";
        _this.slidesHolder.style.transform = "rotate( " + _this.currentAngle + "deg )";
        setTimeout(function () {
          _this.slidesHolder.style.transitionDuration = _this.startSetup.animationDuration + "ms";
        }, 20);
      }, this.startSetup.animationDuration);
    } else if (this.currentSlide === 0 && multiplier === 1) {
      this.slidesHolder.style.transform = "rotate( " + (this.stepAngle * 180) / Math.PI + "deg )";
      this.currentSlide = _this.slides.length - 1;
      this.currentAngle = (-(2 * Math.PI - _this.stepAngle) * 180) / Math.PI;
      this.addStyle();

      setTimeout(function () {
        _this.slidesHolder.style.transitionDuration = 0 + "s";
        _this.slidesHolder.style.transform = "rotate( " + _this.currentAngle + "deg )";
        setTimeout(function () {
          _this.slidesHolder.style.transitionDuration = _this.startSetup.animationDuration + "ms";
        }, 20);
      }, this.startSetup.animationDuration);
    } else {
      this.currentSlide -= multiplier;
      this.currentAngle += ((this.stepAngle * 180) / Math.PI) * multiplier;
      this.slidesHolder.style.transform = "rotate( " + this.currentAngle + "deg )";
      this.addStyle();
    }

    // Reset animation flag
    setTimeout(() => {
      this.isAnimating = false;
    }, this.startSetup.animationDuration + 20);
  };

  Slider.prototype.setNav = function () {
    let _this = this;
    _this.btnLeft.onclick = function () {
      _this.rotate(1);
    };
    _this.btnRight.onclick = function () {
      _this.rotate(-1);
    };
  };

  Slider.prototype.disableNav = function () {
    this.btnLeft.onclick = null;
    this.btnRight.onclick = null;
  };

  Slider.prototype.setAutoplay = function () {
    let _this = this;
    this.autoplay = setInterval(function () {
      _this.rotate(1);
    }, _this.startSetup.autoplayInterval + 20);
  };

  Slider.prototype.removeStyle = function () {
    let x = this.currentSlide;

    this.descriptions[x].classList.remove("descriptions__item_visible");
    this.slides[x].classList.remove("slides-holder__item_active");
    // commented by ak
    // this.slides[x].style.height = this.slides[x].style.width = this.slidesSize + "px";
    this.slides[x].style.width = this.slidesSize + "px";
  };

  Slider.prototype.addStyle = function () {
    let x = this.currentSlide;

    this.descriptions[x].classList.add("descriptions__item_visible");
    this.slides[x].classList.add("slides-holder__item_active");
    // commented by ak
    // this.slides[x].style.height = this.slides[x].style.width = this.slidesSize + 20 + "px";
    this.slides[x].style.width = this.slidesSize + 20 + "px";
  };

  Slider.prototype.resetNavs = function () {
    let _this = this;

    this.disableNav();
    setTimeout(function () {
      _this.setNav();
    }, this.startSetup.animationDuration + 20);
    if (this.autoplay != null) {
      clearInterval(this.autoplay);
      this.setAutoplay();
    }
  };

  Slider.prototype.initClickFeature = function () {
    this.slides.forEach((el, index) => {
      el.addEventListener("click", () => {
        if (this.isAnimating) return;

        const activeIndex = this.currentSlide;
        const clickedIndex = index;

        if (activeIndex === clickedIndex) return; // Do nothing if already active

        const totalSlides = this.slides.length;
        const clockwiseSteps = (clickedIndex - activeIndex + totalSlides) % totalSlides;
        const counterSteps = (activeIndex - clickedIndex + totalSlides) % totalSlides;

        let direction = clockwiseSteps <= counterSteps ? -1 : 1;
        let steps = Math.min(clockwiseSteps, counterSteps);

        // Ensure smooth full-circle rotation
        if (clickedIndex === 0 && activeIndex === totalSlides - 1) {
          direction = -1;
          steps = 1;
        } else if (clickedIndex === totalSlides - 1 && activeIndex === 0) {
          direction = 1;
          steps = 1;
        }

        // Pause autoplay when manually interacting
        if (this.autoplay) {
          clearInterval(this.autoplay);
          this.autoplay = null;
          this.btnAutoplay.classList.remove("controls__autoplay_running");
          this.btnAutoplay.classList.add("controls__autoplay_paused");
        }

        this.removeStyle();
        this.resetNavs();

        // Update the rotation angle
        this.currentSlide = clickedIndex;
        this.currentAngle += direction * ((this.stepAngle * steps * 180) / Math.PI);

        this.slidesHolder.style.transform = `rotate(${this.currentAngle}deg)`;
        this.addStyle();

        // Reset animation flag
        setTimeout(() => {
          this.isAnimating = false;
        }, this.startSetup.animationDuration + 20);
      });
    });
  };

  Slider.prototype.initAutoplay = function () {
    let _this = this;
    this.btnAutoplay.onclick = function () {
      if (this.classList.contains("controls__autoplay_running")) {
        this.classList.remove("controls__autoplay_running");
        this.classList.add("controls__autoplay_paused");
        clearInterval(_this.autoplay);
        _this.autoplay = null;
      } else {
        this.classList.remove("controls__autoplay_paused");
        this.classList.add("controls__autoplay_running");
        _this.setAutoplay();
      }
    };
  };

  Slider.prototype.initDragFeature = function () {
    let _this = this;
    let isDragging = false;
    let startAngle = 0;
    let startRotation = 0;

    function startDrag(e) {
      e.preventDefault();
      if (_this.isAnimating) return;
      isDragging = true;

      const rect = _this.slidesHolder.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      startAngle = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
      const currentTransform = window.getComputedStyle(_this.slidesHolder).getPropertyValue("transform");
      const matrix = new DOMMatrix(currentTransform);
      startRotation = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;

      _this.slidesHolder.style.transitionDuration = "0ms";
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      const rect = _this.slidesHolder.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const clientX = e.clientX || e.touches[0].clientX;
      const clientY = e.clientY || e.touches[0].clientY;

      const currentAngle = (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;
      let rotation = startRotation + (currentAngle - startAngle);
      _this.slidesHolder.style.transform = `rotate(${rotation}deg)`;
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      _this.slidesHolder.style.transitionDuration = _this.startSetup.animationDuration + "ms";

      const currentTransform = window.getComputedStyle(_this.slidesHolder).getPropertyValue("transform");
      const matrix = new DOMMatrix(currentTransform);
      const currentRotation = (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI;

      const anglePerSlide = 360 / _this.slides.length;
      const normalizedRotation = ((currentRotation % 360) + 360) % 360;
      let closestSlide = Math.round(normalizedRotation / anglePerSlide);
      closestSlide = (closestSlide + _this.slides.length) % _this.slides.length;

      _this.currentSlide = (_this.slides.length - closestSlide) % _this.slides.length;
      _this.currentAngle = -closestSlide * anglePerSlide;
      _this.slidesHolder.style.transform = `rotate(${_this.currentAngle}deg)`;

      _this.removeStyle();
      _this.addStyle();
      _this.slides[_this.currentSlide].click();
    }

    // _this.slidesHolder.addEventListener("mousedown", startDrag);
    _this.slidesHolder.addEventListener("touchstart", startDrag, { passive: false });
    // document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    // document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
  };

  ///////////Init sliders///////////
  window.circularSlider1 = new Slider(document.querySelector(".circular-slider-1"), 100, 12, 500, 3000);
  // window.circularSlider2 = new Slider(document.querySelector(".circular-slider-2"), 90, 13, 700, 3000);
  //   window.circularSlider3 = new Slider(document.querySelector(".circular-slider-3"), 80, 18, 800, 3700);
  //   window.circularSlider4 = new Slider(document.querySelector(".circular-slider-4"), 70, 20, 900, 4200);

  let sliders = [window.circularSlider1];

  window.onresize = function () {
    for (let i = 0; i < sliders.length; i++) {
      sliders[i].resetNavs();
      sliders[i].onResize(true);
    }
  };
  //////////////////////
})();
