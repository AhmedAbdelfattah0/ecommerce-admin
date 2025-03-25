import { trigger, transition, style, animate, query, stagger, keyframes } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('0.4s ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
  ])
]);

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger('60ms', [
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const cardAnimation = trigger('cardAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('0.4s cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ])
]);

export const tableRowAnimation = trigger('tableRowAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-10px)' }),
    animate('0.3s ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const pulseAnimation = trigger('pulseAnimation', [
  transition('* => *', [
    animate('0.5s ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const slideInAnimation = trigger('slideInAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('0.5s ease-out', style({ transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('0.5s ease-in', style({ transform: 'translateX(-100%)' }))
  ])
]);

export const rotateAnimation = trigger('rotateAnimation', [
  transition(':enter', [
    style({ transform: 'rotate(-180deg)', opacity: 0 }),
    animate('0.5s ease-out', style({ transform: 'rotate(0)', opacity: 1 }))
  ])
]);

export const bounceAnimation = trigger('bounceAnimation', [
  transition(':enter', [
    animate('0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)', keyframes([
      style({ transform: 'scale(0)', offset: 0 }),
      style({ transform: 'scale(1.2)', offset: 0.7 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);
