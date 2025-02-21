from fastapi import APIRouter, Body
from fastapi.responses import FileResponse
from depends import apartment_service
from schema.apartment import ApartType, MatchingSchema
from service.alghorithm import match_new_apart_to_family_batch
from service.balance_alghorithm import save_views_to_excel
import os 
from fastapi import File, HTTPException, UploadFile, status 
from io import BytesIO
import pandas as pd 
from service.apartment_insert import insert_to_db

router = APIRouter(prefix="/fisrt_matching", tags=["Первичный подбор"])

# Получение списка адресов домов
@router.get("/old_apartment/house_addresses")
async def get_family_structure_house_addresses():
    return await apartment_service.get_house_address_with_room_count(apart_type=ApartType.OLD)

# Получение списка адресов домов
@router.get("/new_apartment/house_addresses")
async def get_new_apartment_house_addresses():
    return await apartment_service.get_house_address_with_room_count(apart_type=ApartType.NEW)

@router.post('/matching')
async def start_matching(
    requirements: MatchingSchema 
): 
    print(requirements.old_apartment_house_address)
    print('--------------------------------------')
    print(requirements.new_apartment_house_address)
    matching_result = match_new_apart_to_family_batch(
                                    new_selected_districts=requirements.new_apartment_district,
                                    old_selected_districts=requirements.old_apartment_district,
                                    new_selected_areas=requirements.new_apartment_municipal_district,
                                    old_selected_areas=requirements.old_apartment_district,
                                    new_selected_addresses=requirements.new_apartment_house_address,
                                    old_selected_addresses=requirements.old_apartment_house_address, 
                                    date=requirements.is_date)
    print(matching_result)
    
    return matching_result


@router.post("/upload-file/")
def upload_file(file: UploadFile = File(...)):
    
    content = file.file.read()
    
    # Чтение Excel-файла в DataFrame
    new_apart = pd.read_excel(BytesIO(content), sheet_name='new_apart')
    old_apart = pd.read_excel(BytesIO(content), sheet_name='old_apart')   
    cin = pd.read_excel(BytesIO(content), sheet_name='cin')
    # Вставка данных
    insert_to_db(new_apart, old_apart, cin)
    
    return {"message": "Файл успешно загружен и обработан"}

