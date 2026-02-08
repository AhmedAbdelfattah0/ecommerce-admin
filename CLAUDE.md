# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 19 e-commerce admin panel for "Lugare Store" (lugarstore.net). It's a standalone component-based application using Angular Material, Tailwind CSS, and ngx-toastr for notifications.

## Development Commands

### Development Server
```bash
npm start
# or
ng serve
```
Runs on http://localhost:4200/

### Build
```bash
npm run build          # Production build
npm run watch          # Development build with watch mode
```

### Testing
```bash
npm test               # Run all tests with Karma
```

### Angular CLI
```bash
ng generate component component-name --standalone    # Generate standalone component
ng generate service service-name                     # Generate service
```

## Architecture

### Application Structure

**Routing Strategy**: Lazy-loaded routes with `PreloadAllModules` strategy and `AuthGuard` protection for all authenticated routes.

**Component Pattern**: All components use standalone component architecture (no NgModules). Components extend `BaseComponent` when they need subscription cleanup via `ngUnSubscribe` Subject.

**State Management**: Signal-based reactivity (`signal()`) is used for local component state. No global state management library is used.

**Form Handling**: Reactive Forms (`ReactiveFormsModule`) with Material form controls.

### Key Architectural Patterns

#### Authentication Flow
- JWT token stored in localStorage with key `auth_token`
- `AuthGuard` (src/app/guards/auth.guard.ts:14) protects all routes except `/login`
- `httpInterceptor` (src/app/common/services/http-interceptor.interceptor.ts:6) prepends API URL to all requests (except `.json` files)
- API base URL configured in environment files: `https://lugarstore.net/api`

#### HTTP Communication
All API endpoints follow PHP-based structure:
- Product operations: `/products/get_products.php`, `/products/create_product.php`, etc.
- Order operations: `/orders/create_order.php`, `/orders/get_orders.php`, etc.
- Authentication: `/users/login.php`
- Notifications: `/notifications/get_notifications.php`, `/notifications/mark_notifications.php`

Services use standardized error handling pattern via `handleError()` method that returns `throwError()`.

#### Notification System
Real-time notification polling (src/app/services/notification/notification.service.ts:41):
- Checks every 30 seconds for new orders, messages, appointments, and custom orders
- Uses `BehaviorSubject` for reactive state updates
- Automatically displays toasters for new notifications
- Tracks unread count in header badge

#### Base Component Pattern
`BaseComponent` (src/app/common/components/base/base.component.ts) provides:
- Common Material module imports via static `materialModules` array
- Automatic subscription cleanup with `ngUnSubscribe` Subject
- Components should extend this and use `.pipe(takeUntil(this.ngUnSubscribe))` for subscriptions

#### Response Structure
All API responses follow `ApiResponse<T>` interface:
```typescript
{
  status: boolean;
  message: string;
  data: T;
}
```

### Feature Modules

**Products**: Create, edit, delete products with multi-image upload (4 images + video), category/subcategory assignment, pricing, and discount management.

**Categories & Marketing Categories**: Two-level hierarchy where "marketing-categories" represents subcategories in the data model (`SubCategory`).

**Orders**: Regular orders, custom orders (bespoke furniture), and appointments. Each has list and detail views with status management.

**Messages**: Contact form submissions from customers with read/unread tracking.

**Banners**: Homepage banner management with image upload and link configuration.

**Dashboard**: Overview page with statistics (implementation in src/app/components/dashboard/dashboard.component.ts).

### Layout Components

**Header** (src/app/components/layout/header/header.component.ts): Notification bell with unread badge, responsive design.

**SideNav** (src/app/components/layout/side-nav/side-nav.component.ts): Desktop navigation menu.

**MobileNav** (src/app/components/layout/mobile-nav/mobile-nav-sheet.component.ts): Mobile bottom sheet navigation.

**ResponsiveService** (src/app/common/services/responsive.service.ts): Detects breakpoints and manages mobile/desktop UI state.

### Styling

**Tailwind CSS v4**: Main styling framework with custom configuration.

**Angular Material**: Azure Blue theme (`@angular/material/prebuilt-themes/azure-blue.css`). Components use Material form controls, cards, buttons, and dialogs.

**SCSS**: Component-scoped styles with `.scss` extension (configured in angular.json:10).

### Data Models

Models are interfaces in `src/app/models/`:
- Products have 4 image fields (`imgOne`, `imgTwo`, `imgThree`, `imgFour`) plus `videoLink`
- Categories have both English (`title`) and Arabic (`titleAr`) fields
- Orders contain customer info, delivery address, items array, and status
- All list responses include pagination metadata

### Environment Configuration

Environment files control API URL:
- `environment.ts`: Development config pointing to `https://lugarstore.net/api`
- `environment.development.ts`: Development-specific overrides
- Build configuration (angular.json:61-66) swaps files based on configuration

## Common Patterns

### Creating New Features

1. Generate standalone component with Material imports from `BaseComponent.materialModules`
2. Create corresponding service in `src/app/services/[feature]/`
3. Define model interfaces in `src/app/models/[feature].ts`
4. Add route in `src/app/app.routes.ts` with lazy loading and `AuthGuard`
5. Use reactive forms for data entry with Material form controls
6. Handle success/error states with toastr notifications

### Form Components

Form components follow this pattern:
- Check route params for `id` to determine edit vs. create mode
- Build `FormGroup` with validators
- Load existing data via service if in edit mode
- On submit, call service method and navigate on success
- Use `BreadcrumbComponent` for navigation context
- Display loading states with Material spinner

### List Components

List components use:
- Material tables or cards for data display
- Search/filter controls in header
- Pagination (when API supports it)
- Action buttons (edit, delete) with confirmation dialogs
- Loading indicators via service signals (e.g., `isProductsLoading`)

## TypeScript Configuration

Strict mode enabled with:
- `strict: true`
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

All new code should respect these constraints.
