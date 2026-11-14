FROM mcr.microsoft.com/devcontainers/python:1-3.12-bullseye

WORKDIR /workspace

RUN apt-get update \
    && apt-get install -y --no-install-recommends sqlite3 \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8000
