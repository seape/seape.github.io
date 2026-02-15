# Production build (uses npm package from registry)

install:
	pnpm install

build-astro: install
	pnpm build && touch dist/.nojekyll

# Switch to development mode (uses local @jet-w/astro-blog)
use-dev:
	cp package.json package.prod.json
	cp package.dev.json package.json
	rm -rf node_modules package-lock.json
	pnpm install

# Switch to production mode (uses npm registry)
use-prod:
	@if [ -f package.prod.json ]; then \
		cp package.prod.json package.json; \
		rm package.prod.json; \
		rm -rf node_modules package-lock.json; \
		pnpm install; \
	else \
		echo "Already in production mode"; \
	fi

# Development build (for local testing)
build-dev:
	pnpm build && touch dist/.nojekyll

# Start dev server
dev:
	pnpm dev