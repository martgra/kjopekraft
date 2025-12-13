ARG VARIANT=3-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/python:${VARIANT}

ARG USERNAME=vscode

USER root

# Install Node.js and Playwright dependencies in a single layer
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends \
    nodejs \
    iputils-ping \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

USER ${USERNAME}

RUN curl -fsSL https://bun.sh/install | bash

RUN mkdir -p /home/${USERNAME}/.vscode-server/extensions \
    && chown -R ${USERNAME} /home/${USERNAME}/.vscode-server

RUN SNIPPET="export PROMPT_COMMAND='history -a' && export HISTFILE=/home/$USERNAME/commandhistory/.zsh_history" \
    && mkdir /home/$USERNAME/commandhistory \
    && touch /home/$USERNAME/commandhistory/.zsh_history \
    && chown -R $USERNAME /home/$USERNAME/commandhistory \
    && echo "$SNIPPET" >> "/home/$USERNAME/.zshrc"
