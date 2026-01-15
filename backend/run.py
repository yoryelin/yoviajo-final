#!/usr/bin/env python
"""
Script para ejecutar el servidor FastAPI.
Uso: python run.py
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8003,
        reload=True
    )
