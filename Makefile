.PHONY: build check dev help

help:
	@printf "Available targets:\n"
	@printf "  dev    Run the dev server\n"
	@printf "  build  Build the app\n"
	@printf "  check  Lint, format, typecheck, and test\n"

dev:
	bun dev

build:
	bun run build

check:
	bun run lint
	bun run format
	bun run typecheck
	bun run test
