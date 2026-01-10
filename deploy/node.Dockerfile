# ----------------------------
# Stage 1: Build the Go binary
# ----------------------------
FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd/keyshard-node ./cmd/keyshard-node
COPY ./pkg ./pkg
COPY ./internal ./internal

RUN go build -o keyshard ./cmd/keyshard-node

# ----------------------------
# Stage 2: Runtime image
# ----------------------------
FROM debian:bookworm-slim

WORKDIR /app

COPY --from=builder /app/keyshard /app/keyshard

# Copy node configs
COPY ./node1.yaml ./node1.yaml
COPY ./node2.yaml ./node2.yaml
COPY ./node3.yaml ./node3.yaml
COPY ./node4.yaml ./node4.yaml
COPY ./node5.yaml ./node5.yaml

# Create data folder
RUN mkdir -p /app/data

# Expose all possible internal ports
EXPOSE 8006 8007 8008 8009 8010

# Entry point
ENTRYPOINT ["./keyshard"]
