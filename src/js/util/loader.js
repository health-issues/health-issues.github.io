import anime from 'animejs';
import log from 'loglevel';

const svgLoader = '<svg class="morph" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="60" height="60"><path class="outline" d="M 378.1,121.2 C 408.4,150 417.2,197.9 411,245.8 404.8,293.7 383.5,341.7 353.4,370.7 303.2,419.1 198.7,427.7 144.5,383.8 86.18,336.5 67.13,221.3 111.9,161 138.6,125 188.9,99.62 240.7,90.92 292.4,82.24 345.6,90.32 378.1,121.2 Z" fill="none" stroke="#341a88" stroke-miterlimit="10" stroke-width="25"/><g transform="scale(7) translate(7, 5)"><ellipse cx="32.52" cy="27.94" rx="4.02" ry="4.1" fill="#341a88"/><path d="M32.75,17.87a4.27,4.27,0,0,1,3.79,2.43" fill="none" stroke="#341a88" stroke-miterlimit="10" stroke-width="3"/><path d="M18.41,41.74c1.48-3.15,5-2.15,6.44-.84,1.88,1.75,5.36.45,6.11-1.16" fill="none" stroke="#341a88" stroke-miterlimit="10" stroke-width="3"/><path d="M37.77,38.33a3.38,3.38,0,0,1,1.52-2.62,14.43,14.43,0,0,0,2.44-2A2.31,2.31,0,0,0,42,30.84" fill="none" stroke="#341a88" stroke-miterlimit="10" stroke-width="3"/><path d="M17.87,29.81c-1.08-1.65.14-4,1.33-4.68,2.43-1.29,3.28-.31,5-1.54s1-5.12,0-5.71" fill="none" stroke="#341a88" stroke-miterlimit="10" stroke-width="3"/></g></svg>';

export class LoadingAnimation {
  paths: [];
  container: HTMLElement;
  isLooping: Boolean;

  constructor(container: HTMLElement) {
    this.container = container;
    this.paths = [
      'M 378.1,121.2 C 408.4,150 417.2,197.9 411,245.8 404.8,293.7 383.5,341.7 353.4,370.7 303.2,419.1 198.7,427.7 144.5,383.8 86.18,336.5 67.13,221.3 111.9,161 138.6,125 188.9,99.62 240.7,90.92 292.4,82.24 345.6,90.32 378.1,121.2 Z',
      'M 418.1,159.8 C 460.9,222.9 497,321.5 452.4,383.4 417.2,432.4 371.2,405.6 271.3,420.3 137.2,440 90.45,500.6 42.16,442.8 -9.572000000000003,381 86.33,289.1 117.7,215.5 144.3,153.4 145.7,54.21 212.7,36.25 290.3,15.36 373.9,94.6 418.1,159.8 Z'
    ];
    this.isLooping = false;
  }

  stop(self: LoadingAnimation) {
    const { container } = self;
    self.isLooping = false;
    container.innerHTML = '';
  };

  play(self: LoadingAnimation, i: number) {
    log.info('play');
    const { isLooping, container, paths } = self;
    const shape = container.querySelector('svg.morph path.outline');
    anime({
      targets: shape,
      duration: 2000,
      easing: 'linear',
      // easing: 'easeOutElastic',
      elasticity: 200,
      delay: 0,
      d: paths[i],
      complete: function() {
        if (isLooping) {
          i = i === 0 ? 1 : 0;
          self.play(self, i);
        }
      }
    });
  }

  start(self: LoadingAnimation, i: number) {
    log.info('Start');
    const { container } = self;
    if (!self.isLooping) {
      log.info('yeah');
      const loader = document.createElement('span');
      loader.classList.add('loader');
      loader.innerHTML = svgLoader;
      container.appendChild(loader);
      self.isLooping = true;
      self.play(self, 0);
    }
  }
}
