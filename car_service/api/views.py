from django.contrib.auth.models import User
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from car_service.repositories.RepositoryManager import RepositoryManager
from .serializer import *

rm = RepositoryManager()


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 100


# ── Користувачі системи (Django User) ────────────────────────────────────────

class UserViewSet(viewsets.ViewSet):
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        users = User.objects.all().order_by('id')
        return Response([self.serialize(u) for u in users])

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.serialize(user))

    def create(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        email = request.data.get('email', '').strip()
        role = request.data.get('role', 'manager')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            is_staff=(role == 'admin'),
        )
        return Response(self.serialize(user), status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        user.email = request.data.get('email', user.email)

        role = request.data.get('role')
        if role:
            user.is_staff = (role == 'admin')

        is_active = request.data.get('isActive')
        if is_active is not None:
            user.is_active = bool(is_active)

        new_password = request.data.get('password', '').strip()
        if new_password:
            user.set_password(new_password)

        user.save()
        return Response(self.serialize(user))

    def destroy(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        if user == request.user:
            return Response(
                {'error': 'Cannot delete yourself'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def me(self, request):
        return Response(self.serialize(request.user))

    @staticmethod
    def serialize(user):
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': 'admin' if user.is_staff else 'manager',
            'isActive': user.is_active,
        }


# ── Базовий ViewSet для решти ресурсів ───────────────────────────────────────

class BaseViewSet(viewsets.ViewSet):
    pagination_class = StandardResultsSetPagination
    serializer_class = None
    repo = None
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        items = self.repo.get_all()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(items, request)
        ser = self.serializer_class(page, many=True)
        return paginator.get_paginated_response(ser.data)

    def retrieve(self, request, pk=None):
        item = self.repo.get_by_id(pk)
        if not item:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.serializer_class(item).data)

    def create(self, request):
        ser = self.serializer_class(data=request.data)
        if ser.is_valid():
            obj = self.repo.create(**ser.validated_data)
            return Response(self.serializer_class(obj).data, status=status.HTTP_201_CREATED)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        item = self.repo.get_by_id(pk)
        if not item:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        ser = self.serializer_class(item, data=request.data, partial=True)
        if ser.is_valid():
            obj = self.repo.update(pk, **ser.validated_data)
            return Response(self.serializer_class(obj).data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        deleted = self.repo.delete(pk)
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class PositionViewSet(BaseViewSet):
    serializer_class = PositionSerializer
    repo = rm.position


class ServiceCenterViewSet(BaseViewSet):
    serializer_class = ServiceCenterSerializer
    repo = rm.serviceCenter


class EmployeeViewSet(BaseViewSet):
    serializer_class = EmployeeSerializer
    repo = rm.employee


class ClientViewSet(BaseViewSet):
    serializer_class = ClientSerializer
    repo = rm.client


class CarViewSet(BaseViewSet):
    serializer_class = CarSerializer
    repo = rm.car


class PartViewSet(BaseViewSet):
    serializer_class = PartSerializer
    repo = rm.part


class ServiceViewSet(BaseViewSet):
    serializer_class = ServiceSerializer
    repo = rm.service


class RepairViewSet(BaseViewSet):
    serializer_class = RepairSerialize
    repo = rm.repair

    @action(detail=False, methods=['get'])
    def report(self, request):
        repairs = self.repo.get_all()
        total_repairs = len(repairs)
        total_services = sum(
            sum(detail.idService.baseCost * detail.count for detail in r.repairdetail_set.all() if detail.idService)
            for r in repairs
        )
        total_part = sum(
            sum(detail.idPart.cost * detail.count for detail in r.repairdetail_set.all() if detail.idPart)
            for r in repairs
        )
        total_additional = sum(
            sum(rd.additionalCost for rd in r.repairdetail_set.all())
            for r in repairs
        )
        grand_total = total_services + total_part + total_additional
        return Response({
            'total_repairs': total_repairs,
            'total_service': total_services,
            'total_part': total_part,
            'total_additional': total_additional,
            'grand_total': grand_total,
        })


class RepairDetailViewSet(BaseViewSet):
    serializer_class = RepairDetailSerializer
    repo = rm.repairDetail