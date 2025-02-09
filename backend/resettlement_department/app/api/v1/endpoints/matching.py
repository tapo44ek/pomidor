from fastapi import APIRouter, Query, Body
from fastapi.responses import FileResponse
from depends import apartment_service
from schema.apartment import ApartType, MatchingSchema
from service.alghorithm import match_new_apart_to_family_batch
from service.balance_alghorithm import save_views_to_excel
import os 
from fastapi import Depends

router = APIRouter(prefix="/fisrt_matching", tags=["Первичный подбор"])


# Получение списка районов
@router.get("/family_structure/district")
async def get_family_structure_districts(
):
    return await apartment_service.get_district(apart_type=ApartType.OLD)


# Получение списка муниципальных районов
@router.get("/family_structure/municipal_district")
async def get_family_structure_areas(
    districts: list[str] = Query(..., description="Список районов")
):
    return await apartment_service.get_municipal_districts(apart_type=ApartType.OLD, districts=districts)


# Получение списка адресов домов
@router.get("/family_structure/house_addresses")
async def get_family_structure_house_addresses(
    municipal_districts: list[str] = Query(..., description="Список областей")
):
    return await apartment_service.get_house_addresses(apart_type=ApartType.OLD, municipal_districts=municipal_districts)


# Получение списка районов
@router.get("/new_apartment/district")
async def get_new_apartment_districts(
):
    return await apartment_service.get_district(apart_type=ApartType.NEW)


# Получение списка муниципальных районов
@router.get("/new_apartment/municipal_district")
async def get_new_apartment_areas(
    districts: list[str] = Query(..., description="Список районов")
):
    return await apartment_service.get_municipal_districts(apart_type=ApartType.NEW, districts=districts)


# Получение списка адресов домов
@router.get("/new_apartment/house_addresses")
async def get_new_apartment_house_addresses(
    municipal_districts: list[str] = Query(..., description="Список областей")
):
    return await apartment_service.get_house_addresses(apart_type=ApartType.NEW, municipal_districts=municipal_districts)

@router.post('/matching')
async def start_matching(
    requirements: MatchingSchema = Depends()
):
    result = None 
    try:
        match_new_apart_to_family_batch(new_selected_addresses=requirements.new_apartment_house_address, old_selected_addresses=requirements.family_structure_house_address)
        result = 'ok'
    except Exception as e: 
        result = e 
    return {"message": result}

@router.post('/balance')
async def balance(
    requirements: MatchingSchema = Depends()
):
    try:
        # Формируем путь для сохранения файла
        output_path = os.path.join(os.getcwd(), 'uploads', 'matching_result.xlsx')

        # Сохраняем файл (здесь вызывается ваша функция)
        save_views_to_excel(
            output_path=output_path,
            new_selected_addresses=requirements.new_apartment_house_address,
            old_selected_addresses=requirements.family_structure_house_address
        )

        # Возвращаем файл клиенту
        return FileResponse(
            path=output_path,
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename='matching_result.xlsx'
        )
    except Exception as e:
        return {"error": str(e)}