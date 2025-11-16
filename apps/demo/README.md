# AuthSome UI Demo Application

Interactive demo application showcasing all features of AuthSome UI with **Tailwind CSS v4** and latest **shadcn/ui**.

## Features

- **Interactive Playground**: Try all components with live previews
- **Example Pages**: Complete examples for each authentication flow
- **Provider Switching**: Test different auth providers
- **Dark Mode**: Built-in theme switching
- **Code Examples**: View source code for each component
- **Tailwind CSS v4**: Using the latest Tailwind CSS with CSS-based configuration
- **Latest shadcn/ui**: Modern component library with Radix UI

## Tech Stack

- **Next.js 15** - App Router with React Server Components
- **Tailwind CSS v4** - CSS-first configuration with `@theme` directive
- **shadcn/ui** - Latest components with Radix UI primitives
- **TypeScript 5.3** - Type-safe development
- **lucide-react** - Modern icon library

## Getting Started

### Install Dependencies

```bash
cd apps/demo
pnpm install
```

### Environment Variables

Create a `.env.local` file:

```bash
# AuthSome Backend
NEXT_PUBLIC_AUTHSOME_API_URL=http://localhost:8080/api/auth

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Generic API (optional)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tailwind CSS v4 Features

This demo uses Tailwind CSS v4 with the following modern features:

### CSS-First Configuration

Instead of a JavaScript config file, Tailwind v4 uses CSS:

```css
@import "tailwindcss";

@theme {
  --color-primary: 222.2 47.4% 11.2%;
  --radius-lg: 0.5rem;
}
```

### Benefits

- **Faster builds**: Up to 10x faster than v3
- **Better IntelliSense**: Native CSS with better editor support
- **Smaller bundle**: Only includes what you use
- **Type-safe**: CSS variables with autocomplete

### Migration from v3

The demo includes compatibility CSS variables to work with existing shadcn/ui components:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other variables */
}
```

## Latest shadcn/ui Components

The demo uses the latest shadcn/ui components with:

- **Radix UI primitives** - Accessible component foundation
- **Class Variance Authority** - Type-safe component variants
- **tailwind-merge** - Intelligent class merging
- **Latest component patterns** - Modern React patterns

### Component Updates

All shadcn/ui components are updated to work with Tailwind v4:

- Button with CVA variants
- Input with proper focus states
- Card with modern layouts
- Tabs with smooth animations

## Project Structure

```
apps/demo/
├── src/
│   ├── app/
│   │   ├── globals.css           # Tailwind v4 with @theme
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   ├── playground/
│   │   │   └── page.tsx          # Interactive playground
│   │   ├── examples/
│   │   │   ├── page.tsx          # Examples overview
│   │   │   ├── email-password/   # Email/password example
│   │   │   ├── oauth/            # OAuth example
│   │   │   └── ...               # Other examples
│   │   └── dashboard/            # Protected dashboard
│   ├── lib/
│   │   └── auth-client.ts        # Auth client configuration
│   └── components/               # Demo-specific components
├── next.config.js                # Next.js config with Tailwind v4
└── package.json                  # Dependencies
```

## Available Examples

1. **Email/Password** - Traditional authentication
2. **OAuth Providers** - Social login (Google, GitHub, etc.)
3. **Magic Links** - Passwordless email authentication
4. **Two-Factor Auth** - TOTP, SMS, and email 2FA
5. **Phone Auth** - SMS verification
6. **Username Auth** - Username-based authentication
7. **Passkeys** - WebAuthn/FIDO2

## Build for Production

```bash
pnpm build
pnpm start
```

## Development Tips

### Hot Reload

Tailwind CSS v4 provides instant feedback on style changes without full page reloads.

### CSS IntelliSense

VS Code users can install the Tailwind CSS IntelliSense extension for autocomplete on CSS variables.

### Custom Themes

Modify the `@theme` block in `globals.css` to customize the design system:

```css
@theme {
  --color-primary: 220 90% 56%;  /* Custom blue */
  --radius-lg: 1rem;              /* Larger radius */
}
```

### Dark Mode

Toggle dark mode using the `class` strategy:

```tsx
<html className="dark">
  {/* Dark mode active */}
</html>
```

## Performance

Tailwind CSS v4 optimizations:

- **Build time**: 10x faster than v3
- **Bundle size**: ~30% smaller
- **Runtime**: Zero-cost abstractions
- **Tree-shaking**: Automatic unused code elimination

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Styles Not Loading

1. Ensure `@import "tailwindcss"` is at the top of `globals.css`
2. Clear Next.js cache: `rm -rf .next`
3. Restart dev server

### CSS Variables Not Working

Make sure CSS variables are defined in both `:root` and `.dark` selectors for dark mode support.

### TypeScript Errors

Run type checking:

```bash
pnpm type-check
```

## Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Radix UI Primitives](https://www.radix-ui.com)

## License

MIT
