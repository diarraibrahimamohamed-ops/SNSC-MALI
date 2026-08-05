FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=vaccin_track
ENV POSTGRES_USER=vaccin_user
ENV POSTGRES_PASSWORD=vaccin_password

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 5432

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB
