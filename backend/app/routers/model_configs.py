from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException

from app.core.store import store
from app.schemas.chat import CreateModelConfigRequest, UpdateModelConfigRequest

router = APIRouter(prefix="/api/model-configs", tags=["model-configs"])


@router.get("")
def list_model_configs() -> dict:
    return {"data": store.model_configs}


@router.post("")
def create_model_config(payload: CreateModelConfigRequest) -> dict:
    if payload.is_default:
        for item in store.model_configs:
            item["is_default"] = False

    model_config = {
        "id": store.gen_id("model"),
        "provider": payload.provider,
        "model_name": payload.model_name,
        "api_key": payload.api_key,
        "is_default": payload.is_default,
        "created_at": datetime.utcnow().isoformat(),
    }
    store.model_configs.append(model_config)
    return {"data": model_config}


@router.patch("/{config_id}")
def update_model_config(config_id: str, payload: UpdateModelConfigRequest) -> dict:
    for index, item in enumerate(store.model_configs):
        if item["id"] == config_id:
            patch = payload.model_dump(exclude_unset=True)
            if patch.get("is_default") is True:
                for m in store.model_configs:
                    m["is_default"] = False
            merged = {**item, **patch}
            store.model_configs[index] = merged
            return {"data": merged}
    raise HTTPException(status_code=404, detail="Model config not found")


@router.delete("/{config_id}")
def delete_model_config(config_id: str) -> dict:
    for idx, item in enumerate(store.model_configs):
        if item["id"] == config_id:
            deleted = store.model_configs.pop(idx)
            return {"data": deleted}
    raise HTTPException(status_code=404, detail="Model config not found")
