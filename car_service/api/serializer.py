from rest_framework import serializers
from car_service.models import (
    Position, ServiceCenter, Employee, Client, Car, Part, Service, Repair, RepairDetail
)


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = '__all__'


class ServiceCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCenter
        fields = '__all__'


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'
        # Рядка depth = 1 тут більше НЕМАЄ!

    # Ця функція замінює depth=1. Вона розгортає ID у текст ТІЛЬКИ коли сервер ВІДДАЄ дані.
    def to_representation(self, instance):
        response = super().to_representation(instance)
        if instance.idPosition:
            response['idPosition'] = {
                'idPosition': instance.idPosition.idPosition,
                'positionName': instance.idPosition.positionName
            }
        if instance.idServiceCenter:
            response['idServiceCenter'] = {
                'idServiceCenter': instance.idServiceCenter.idServiceCenter,
                'name': instance.idServiceCenter.name
            }
        return response


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = '__all__'


class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class RepairSerialize(serializers.ModelSerializer):
    class Meta:
        model = Repair
        fields = '__all__'

    def to_representation(self, instance):
        response = super().to_representation(instance)
        if instance.idCar:
            response['idCar'] = {
                'idCar': instance.idCar.idCar,
                'brand': instance.idCar.brand,
                'model': instance.idCar.model,
                'yearOfRelease': instance.idCar.yearOfRelease,
                'vin': instance.idCar.vin,
                'licensePlate': instance.idCar.licensePlate,
            }
        if instance.idClient:
            response['idClient'] = {
                'idClient': instance.idClient.idClient,
                'firstName': instance.idClient.firstName,
                'lastName': instance.idClient.lastName,
                'phoneNumber': instance.idClient.phoneNumber,
                'email': instance.idClient.email,
            }
        if instance.idServiceCenter:
            response['idServiceCenter'] = {
                'idServiceCenter': instance.idServiceCenter.idServiceCenter,
                'name': instance.idServiceCenter.name,
                'address': instance.idServiceCenter.address,
                'phoneNumber': instance.idServiceCenter.phoneNumber,
            }
        return response


class RepairDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RepairDetail
        fields = '__all__'
